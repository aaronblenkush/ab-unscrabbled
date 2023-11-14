export function api(customFetch = fetch) {
    return {
        getDictionary: async () => {
            let res = await customFetch("./scrabble-dictionary.txt");
            let txt = await res.text();

            let dictionary = txt.split("\n")
                .map(line => {
                    return line.trim().split(" ")[1];
                })
            ;
            let solver = dictionary.reduce(
                ((acc,word) => {
                    let token = [...word].sort().join('');
                    acc[token] = acc[token] || [];
                    acc[token].push(word);
                    return acc;
                }),
                {}
            );
            return { dictionary, solver };
        },
    };
}
