// declare module 'WriteContractResult' {
//     interface WriteContractResult {
//       wait: () => Promise<TransactionReceipt>;
//     }
//   }

declare module "*.svg" {
  const content: React.FunctionComponent<React.SVGAttributes<SVGElement>>;
  export default content;
}