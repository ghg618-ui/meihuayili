export default async function handler(req, res) {
    const userMessage = req.body.message;
    
    // 固化提示词：大师不再需要算卦，只需要分析
    const SYSTEM_PROMPT = `你现在是顶级【梅花义理断卦大师】。用户会提供已经起好的【本卦、变卦、动爻】以及问题。你的任务是根据这些已确定的象数，运用体用生克进行深刻解析。不要质疑卦象的准确性。`;

    try {
        const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${process.env.DEEPSEEK_API_KEY}` 
            },
            body: JSON.stringify({
                model: 'deepseek-reasoner', // 强制使用 R1 满血版
                messages: [
                    { role: 'system', content: SYSTEM_PROMPT },
                    { role: 'user', content: userMessage }
                ]
            })
        });

        const data = await response.json();
        res.status(200).json({ reply: data.choices[0].message.content });

    } catch (error) {
        res.status(500).json({ reply: "引擎连接中断，请检查 DeepSeek 余额或网络。" });
    }
}
