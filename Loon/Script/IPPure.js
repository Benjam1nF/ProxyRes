/*
 * IPPure 节点 IP 纯净度 (Loon 选中节点适配)
 */
const url = "https://my.ippure.com/v1/info"

// 解析 $argument，允许手动指定 node
const arg = typeof $argument === "string"
    ? Object.fromEntries($argument.split("&").map(kv => kv.split("=")))
    : {}

const envNode = $environment?.params?.node  // 仅在节点脚本工具触发时有值
const node = arg.node || envNode            // 优先参数，其次选中节点

$httpClient.get({ url, ...(node ? { node } : {}) }, (err, resp, data) => {
    if (err) {
        $done({ title: "IP 纯净度", content: "请求失败", icon: "network.slash" })
        return
    }

    let j
    try {
        j = JSON.parse(data)
    } catch (e) {
        $done({ title: "IP 纯净度", content: "解析响应失败", icon: "network.slash" })
        return
    }

    const flag = flagEmoji(j.countryCode)
    const nativeText = j.isResidential ? "✅ 是（原生）" : "🏢 否（机房/商业）"
    const risk = j.fraudScore

    let riskText = `风险系数：${risk}`
    let titleColor = "#007AFF"
    if (risk >= 80) { riskText = `🛑 极高风险 (${risk})`; titleColor = "#FF3B30" }
    else if (risk >= 70) { riskText = `⚠️ 高风险 (${risk})`; titleColor = "#FF9500" }
    else if (risk >= 40) { riskText = `🔶 中等风险 (${risk})`; titleColor = "#FFCC00" }
    else { riskText = `✅ 低风险 (${risk})`; titleColor = "#34C759" }

    $done({
        title: "节点 IP 纯净度",
        content: `IP：${j.ip}
ASN：AS${j.asn} ${j.asOrganization}
位置：${flag} ${j.country} ${j.city}
原生 IP：${nativeText}
${riskText}`,
        icon: risk >= 70 ? "exclamationmark.triangle.fill" : "checkmark.seal.fill",
        "title-color": titleColor
    })
})

function flagEmoji(code) {
    return String.fromCodePoint(...code.toUpperCase().split("").map(c => 127397 + c.charCodeAt()))
}
