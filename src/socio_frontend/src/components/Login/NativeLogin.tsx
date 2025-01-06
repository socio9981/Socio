// export const authWithNativeII = async ({
//     url,
//     maxTimeToLive,
//     allowPinAuthentication,
//     derivationOrigin,
//     sessionIdentity,
//     autoSelectionPrincipal,
//   }: {
//     url: string;
//     maxTimeToLive?: bigint;
//     allowPinAuthentication?: boolean;
//     derivationOrigin?: string;
//     sessionIdentity: SignIdentity;
//     autoSelectionPrincipal?: string;
//   }): Promise<{ identity: DelegationIdentity; authnMethod: string }> => {
//     const sessionPublicKey: Uint8Array = new Uint8Array(sessionIdentity.getPublicKey().toDer());
    
//     const requestParams = new URLSearchParams({
//       kind: "authorize-client",
//       sessionPublicKey: JSON.stringify(sessionPublicKey),
//       maxTimeToLive: maxTimeToLive?.toString() ?? '',
//       derivationOrigin: derivationOrigin ?? '',
//       allowPinAuthentication: allowPinAuthentication ? 'true' : 'false',
//       autoSelectionPrincipal: autoSelectionPrincipal ?? '',
//     });
  
//     const authUrl = `${url}&${requestParams.toString()}`;
  
//     // Open the URL in an in-app browser
//     await Browser.open({ url: authUrl });
  
//     // Wait for the deep link response
//     const deepLinkPromise = new Promise<{ data: string }>((resolve, reject) => {
//       App.addListener('appUrlOpen', (data: { url: string }) => {
//         const url = new URL(data.url);
//         const delegationToken = url.searchParams.get('delegationToken');
//         if (delegationToken) {
//           resolve({ data: delegationToken });
//         } else {
//           reject('Delegation token missing in URL');
//         }
//       });
//     });
  
//     const result = await deepLinkPromise;
  
//     const identity = identityFromResponse({
//       response: {
//         kind: "authorize-client-success",
//         delegations: JSON.parse(result.data), // Ensure delegation data is correctly passed in deep link
//         userPublicKey: sessionPublicKey,
//         authnMethod: "deep-link",
//       } as AuthResponseSuccess,
//       sessionIdentity,
//     });
  
//     return { identity, authnMethod: "deep-link" };
//   };