// Flips for a random number between 0 and 1, prints respective heads/tails outcome
function flipCoin() {
    let coin = Math.floor(Math.random() * 2);

    if(coin === 0) {
        document.getElementById("outcome").innerText = "You flipped...heads!";
    } else {
        document.getElementById("outcome").innerText = "You flipped...tails!";
    }
}