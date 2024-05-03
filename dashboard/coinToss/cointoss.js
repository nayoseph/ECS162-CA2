function flipCoin() {
    let coin = Math.floor(Math.random() * 2);

    if(coin === 0) {
        document.getElementById("outcome").innerText = "You flipped...heads!";
    } else {
        document.getElementById("outcome").innerText = "You flipped...tails!";
    }
}