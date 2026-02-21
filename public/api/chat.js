export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).send('Method Not Allowed');

    const userMessage = req.body.message;

    // 💡 您的终极提示词，直接焊死在服务器端，前端绝对看不到！
    const SYSTEM_PROMPT = `你现在是顶级【梅花义理大师】。请根据梅花易数规则，给出深刻、一针见血的推演。包含体用生克与核心义理分析。`;

    try {
        const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${process.env.DEEPSEEK_API_KEY}` 
            },
            body: JSON.stringify({
                model: 'deepseek-reasoner',
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
