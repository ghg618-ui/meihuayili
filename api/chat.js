export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).send('Method Not Allowed');

    const userMessage = req.body.message;

    // 💡 您的终极提示词，直接焊死在服务器端
    const SYSTEM_PROMPT = `你现在是顶级【梅花义理大师】。请根据梅花易数规则，给出深刻、一针见血的推演。包含体用生克与核心义理分析。`;

    try {
        // 核心改动 1：换成谷歌的 OpenAI 兼容接口地址
        const response = await fetch('https://generativelanguage.googleapis.com/v1beta/openai/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                // 核心改动 2：呼叫环境变量里的谷歌密钥
                'Authorization': `Bearer ${process.env.GOOGLE_API_KEY}` 
            },
            body: JSON.stringify({
                // 核心改动 3：换成您心心念念的顶级模型代号
                model: 'gemini-2.5-pro', 
                messages: [
                    { role: 'system', content: SYSTEM_PROMPT },
                    { role: 'user', content: userMessage }
                ],
                temperature: 0.7
            })
        });

        const data = await response.json();
        const replyText = data.choices[0].message.content;
        res.status(200).json({ reply: replyText });

    } catch (error) {
        console.error("引擎报错:", error);
        res.status(500).json({ error: 'Failed to generate response' });
    }
}
