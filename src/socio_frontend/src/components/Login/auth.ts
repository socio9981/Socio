import type { SignIdentity, Signature } from "@dfinity/agent";
import { Capacitor } from "@capacitor/core";
import { Browser } from "@capacitor/browser";
import { App } from "@capacitor/app";
import {
  Delegation,
  DelegationChain,
  DelegationIdentity,
  SignedDelegation,
} from "@dfinity/identity";
import { Principal } from "@dfinity/principal";

// The type of response from II as per the spec
interface AuthResponseSuccess {
  kind: "authorize-client-success";
  delegations: {
    delegation: {
      pubkey: Uint8Array;
      expiration: bigint;
      targets?: Principal[];
    };
    signature: Uint8Array;
  }[];
  userPublicKey: Uint8Array;
  authnMethod: "pin" | "passkey" | "recovery" | "deep-link";
}

// Perform a sign in to II using parameters set in this app
export const authWithII = async ({
  url: url_,
  maxTimeToLive,
  allowPinAuthentication,
  derivationOrigin,
  sessionIdentity,
  autoSelectionPrincipal,
}: {
  url: string;
  maxTimeToLive?: bigint;
  allowPinAuthentication?: boolean;
  derivationOrigin?: string;
  autoSelectionPrincipal?: string;
  sessionIdentity: SignIdentity;
}): Promise<{ identity: DelegationIdentity; authnMethod: string }> => {
  const iiUrl = new URL(url_);
  iiUrl.hash = "#authorize";
  if (Capacitor.isNativePlatform()) {
    iiUrl.searchParams.set('redirect_uri', 'io.ionic.starter://callback');
  }

  if (Capacitor.isNativePlatform()) {
    // Native flow using deep linking
    return authWithNativeII({
      url: iiUrl.toString(),
      maxTimeToLive,
      allowPinAuthentication,
      derivationOrigin,
      sessionIdentity,
      autoSelectionPrincipal,
    });
  } else {
    // Web flow using postMessage
    return authWithWebII({
      url: iiUrl.toString(),
      maxTimeToLive,
      allowPinAuthentication,
      derivationOrigin,
      sessionIdentity,
      autoSelectionPrincipal,
    });
  }
};

// Native platform authentication using deep linking
export const authWithNativeII = async ({
  url: url_,
  maxTimeToLive,
  allowPinAuthentication,
  derivationOrigin,
  sessionIdentity,
  autoSelectionPrincipal,
}: {
  url: string;
  maxTimeToLive?: bigint;
  allowPinAuthentication?: boolean;
  derivationOrigin?: string;
  autoSelectionPrincipal?: string;
  sessionIdentity: SignIdentity;
}): Promise<{ identity: DelegationIdentity; authnMethod: string }> => {
  // Step 1: Construct the II URL with the authorize hash
  const iiUrl = new URL(url_);
  iiUrl.hash = '#authorize';
  iiUrl.searchParams.append('redirect_uri', 'io.ionic.starter://callback');

  const requestParams = new URLSearchParams({
    kind: "authorize-client",
    sessionPublicKey: JSON.stringify(new Uint8Array(sessionIdentity.getPublicKey().toDer())),
    maxTimeToLive: maxTimeToLive?.toString() ?? '',
    derivationOrigin: derivationOrigin ?? '',
    allowPinAuthentication: allowPinAuthentication ? 'true' : 'false',
    autoSelectionPrincipal: autoSelectionPrincipal ?? '',
  })

  const authUrl = `${iiUrl.toString()}&${requestParams.toString()}`;

  // Step 2: Open the II URL using Capacitor Browser
  await Browser.open({ url: authUrl });

  // Step 3: Listen for the app scheme callback
  const redirectPromise = new Promise<string>(async (resolve, reject) => {
    const handler = await App.addListener('appUrlOpen', (event) => {
      console.log("adding listener");
      console.log(event);
      const callbackUrl = event.url;

      // Check if the URL matches the expected scheme
      if (callbackUrl.startsWith('io.ionic.starter://callback')) {
        App.removeAllListeners(); // Remove all listeners once URL is handled
        resolve(callbackUrl);
      } else {
        reject(new Error('Unexpected URL scheme received.'));
      }
    });

    // Fallback in case the listener is never triggered
    setTimeout(() => {
      handler.remove(); // Clean up the listener after timeout
      reject(new Error('Timeout waiting for callback URL.'));
    }, 60000); // 60 seconds timeout
  });

  // Wait for the redirect URL
  const callbackUrl = await redirectPromise;

  // Step 4: Extract the parameters from the callback URL
  const url = new URL(callbackUrl);
  const delegations = url.searchParams.get('delegations');
  const userPublicKey = url.searchParams.get('userPublicKey');
  const authnMethod = url.searchParams.get('authnMethod');

  if (!delegations || !userPublicKey) {
    throw new Error('Missing required parameters in callback URL.');
  }

  // Step 5: Process the response and create the DelegationIdentity
  const response = {
    kind: 'authorize-client-success',
    delegations: JSON.parse(decodeURIComponent(delegations)),
    userPublicKey: Uint8Array.from(
      atob(decodeURIComponent(userPublicKey)),
      (c) => c.charCodeAt(0)
    ),
    authnMethod,
  };

  const identity = identityFromResponse({
    response: response as AuthResponseSuccess,
    sessionIdentity,
  });

  // Step 6: Close the browser (optional)
  await Browser.close();

  return { identity, authnMethod: authnMethod || 'unknown' };
};

// Web platform authentication using postMessage
const authWithWebII = async ({
  url,
  maxTimeToLive,
  allowPinAuthentication,
  derivationOrigin,
  sessionIdentity,
  autoSelectionPrincipal,
}: {
  url: string;
  maxTimeToLive?: bigint;
  allowPinAuthentication?: boolean;
  derivationOrigin?: string;
  sessionIdentity: SignIdentity;
  autoSelectionPrincipal?: string;
}): Promise<{ identity: DelegationIdentity; authnMethod: string }> => {
  const win = window.open(url, "ii-window");
  if (win === null) {
    throw new Error(`Could not open window for '${url}'`);
  }

  // Wait for II to say it's ready
  const evnt = await new Promise<MessageEvent>((resolve) => {
    const readyHandler = (e: MessageEvent) => {
      if (e.origin !== new URL(url).origin) {
        return;
      }
      window.removeEventListener("message", readyHandler);
      resolve(e);
    };
    window.addEventListener("message", readyHandler);
  });

  if (evnt.data.kind !== "authorize-ready") {
    throw new Error("Bad message from II window: " + JSON.stringify(evnt));
  }

  const sessionPublicKey: Uint8Array = new Uint8Array(sessionIdentity.getPublicKey().toDer());

  const request = {
    kind: "authorize-client",
    sessionPublicKey,
    maxTimeToLive,
    derivationOrigin,
    allowPinAuthentication,
    autoSelectionPrincipal,
  };

  win.postMessage(request, new URL(url).origin);

  // Wait for the II response
  const response = await new Promise<MessageEvent>((resolve) => {
    const responseHandler = (e: MessageEvent) => {
      if (e.origin !== new URL(url).origin) {
        return;
      }
      window.removeEventListener("message", responseHandler);
      win.close();
      resolve(e);
    };
    window.addEventListener("message", responseHandler);
  });

  const message = response.data;
  if (message.kind !== "authorize-client-success") {
    throw new Error("Bad reply: " + JSON.stringify(message));
  }

  const identity = identityFromResponse({
    response: message as AuthResponseSuccess,
    sessionIdentity,
  });

  return { identity, authnMethod: message.authnMethod };
};

// Process the identity and delegations
const identityFromResponse = ({
  sessionIdentity,
  response,
}: {
  sessionIdentity: SignIdentity;
  response: AuthResponseSuccess;
}): DelegationIdentity => {
  const delegations = response.delegations.map(extractDelegation);

  const delegationChain = DelegationChain.fromDelegations(
    delegations,
    response.userPublicKey.buffer
  );

  const identity = DelegationIdentity.fromDelegation(
    sessionIdentity,
    delegationChain
  );

  return identity;
};

// Extract the delegation from the response
export const extractDelegation = (
  signedDelegation: AuthResponseSuccess["delegations"][number]
): SignedDelegation => ({
  delegation: new Delegation(
    signedDelegation.delegation.pubkey,
    signedDelegation.delegation.expiration,
    signedDelegation.delegation.targets
  ),
  signature: signedDelegation.signature.buffer as Signature,
});
