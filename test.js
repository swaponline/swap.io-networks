let words = ['banana', 'grapefruit', 'banana', 'grapefruit', 'banana', 'orange', 'banana'];

const sortArr = array => {
    return [...new Set(array.sort((a, b) => {
        let sumA;
        let sumB;
        array.forEach(fruit => {
            if (fruit === a) ++sumA
            if (fruit === b) ++sumB
        });
        return sumA - sumB
    }))]
}

console.log(sortArr(words))