export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).send('Method Not Allowed');

    const userMessage = req.body.message;
    const SYSTEM_PROMPT = `你现在是顶级【梅花义理大师】。请根据梅花易数规则，给出深刻、一针见血的推演。包含体用生克与核心义理分析。`;

    try {
        const apiKey = process.env.GOOGLE_API_KEY;
        
        // 诊断 1：检查 Vercel 里到底有没有填密钥
        if (!apiKey) {
            return res.status(200).json({ reply: "🚨 诊断雷达报警：Vercel 环境变量中丢失了 GOOGLE_API_KEY！请检查 Vercel 设置并重新 Deploy。" });
        }

        const response = await fetch('https://generativelanguage.googleapis.com/v1beta/openai/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: 'gemini-1.5-pro',
                messages: [
                    { role: 'system', content: SYSTEM_PROMPT },
                    { role: 'user', content: userMessage }
                ],
                temperature: 0.7
            })
        });

        const data = await response.json();

        // 诊断 2：强行拦截并打印谷歌的真实报错信息
        if (data.error) {
            return res.status(200).json({ reply: `🛑 谷歌机房拒绝了请求！真实报错原因：\n\n ${data.error.message || JSON.stringify(data.error)}` });
        }

        // 正常输出
        if (data.choices && data.choices.length > 0) {
            const replyText = data.choices[0].message.content;
            res.status(200).json({ reply: replyText });
        } else {
            res.status(200).json({ reply: `❓ 收到谷歌的未知格式数据：${JSON.stringify(data)}` });
        }

    } catch (error) {
        console.error("引擎报错:", error);
        res.status(200).json({ reply: `💥 内部代码执行异常：${error.message}` });
    }
}
