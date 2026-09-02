declare module "file-saver" {
  export function saveAs(data: Blob | string, filename?: string, options?: { autoBom?: boolean }): void;
  const _default: { saveAs: typeof saveAs };
  export default _default;
}
