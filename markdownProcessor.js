async function main({ params }: { params: { input: string, input1: string } }): Promise<{ 
    key0: string, 
    key1: string[], 
    key2: { key21: string } 
}> {
    const input = params.input || '';
    const input1 = params.input1 || '';
    
    return {
        key0: input,
        key1: [params.input, params.input1],
        key2: { key21: `${params.input} ${params.input1}` }
    };
}

// 使用全局变量导出函数以便在浏览器中使用
if (typeof window !== 'undefined') {
    window.main = main;
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = main;
} else if (typeof define === 'function' && define.amd) {
    define([], function() { return main; });
}