let lastCallTimestamp = null;

function showMemoUsage() {
  const usageMb = (process.memoryUsage().rss / 1000 / 1000).toFixed(2)
  const interval = ((Date.now() - lastCallTimestamp) / 1000).toFixed(3)
  const intervalString = lastCallTimestamp ? `(${interval} sec)` : ''
  console.log(`Memory used: ${usageMb} MB ` + intervalString)
  lastCallTimestamp = Date.now();
}

showMemoUsage()
setInterval(() => showMemoUsage(), 1000)


setTimeout(() =>{
  console.log('Finished'); 
  process.exit(0)
}, 5000)