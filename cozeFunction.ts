async function main({ params }: { params: { input: string, input1: string, input3: string } }): Promise<{ 
    key0: Array<{ fields: { 内容: string } }>, 
    key1: string[], 
    key2: { key21: string } 
}> {
    return {
        key0: [
            {
                fields: {
                    内容: params.input
                }
            },
            {
                fields: {
                    内容: params.input1
                }
            },
            {
                fields: {
                    内容: params.input3
                }
            }
        ],
        key1: ["hello", "world"],
        key2: { key21: "hi" }
    };
}