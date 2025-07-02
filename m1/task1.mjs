import crypto from 'node:crypto'

// #1
const e1Arr = Array.from({ length: 1e6}, (_, i) => i + 1)

// #2
function reportMemo() {
  const cb = () => {
    console.log(process.memoryUsage());
    reportMemo()
  }
  const ms = 1000 - Date.now() % 1000
  console.log('settingTimer', Date.now(), ms)
  setTimeout(cb, ms)
}
reportMemo()

// #3
const calcHash = async (el) => crypto.hash('sha256', el)
const hashes = await Promise.all(e1Arr.map((v) => calcHash(v.toString())))

// #4
let sumWithFor = 0
for (let i = 0; i < e1Arr.length; i++) sumWithFor += e1Arr[i]

// #5
const sumNoFor = e1Arr.reduce((a, c) => a + c, 0)

// #6
const BATCH_SIZE = 100
let sumBatches = 0

for (let i = 0; i < Math.ceil(e1Arr.length / BATCH_SIZE); i++) {
  setTimeout(() => {
    let batchSum = 0

    const OFFSET = BATCH_SIZE * i
    const limit = e1Arr.length - OFFSET > BATCH_SIZE 
      ? BATCH_SIZE 
      : e1Arr.length - OFFSET
    for (let j = 0; j < limit; j++) batchSum += e1Arr[OFFSET + j]

    sumBatches += batchSum
  })
}

// console.log(crypto.hash('sha256', 'a'), crypto.hash('sha256', 'a'), crypto.hash('sha256', 'b'),)
