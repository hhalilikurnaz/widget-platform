import { RUNTIME_CDN_ORIGIN } from '../constants/index.js';

export function generateEmbedSnippet(embedToken: string, cdnOrigin = RUNTIME_CDN_ORIGIN): string {
  return `<script src="${cdnOrigin}/widget.js"></script>
<script>
WidgetPlatform.init({
  token: "${embedToken}"
})
</script>`;
}
