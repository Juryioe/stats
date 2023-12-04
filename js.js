const getLocalStorage = (key) => {
  const value = localStorage.getItem(key)
  return JSON.parse(value)
}

const setLocalStorage = (key, value) => {
  localStorage.setItem(key, JSON.stringify(value))
}

function handle_komfovent_mode(block, key, val) {
  let textVal = 'Off'
  switch (val) {
    case 0:
      textVal = 'Off'
      break
    case 1:
      textVal = 'Minimum'
      break
    case 2:
      textVal = 'Normal'
      break
    case 3:
      textVal = 'Intense'
      break
    case 4:
      textVal = 'Maximum'
      break
    default:
      textVal = 'Unknown'
      break
  }

  block.textContent = textVal
  return textVal
}

function handle_dsc_zones(block, key, val) {
  val == 1
    ? block.classList.add('red_color')
    : block.classList.remove('red_color')
  block.textContent = val == 0 ? 'Closed' : 'Open'
}

function handle_dsc_status(block, key, val) {
  val == 0
    ? block.classList.add('red_color')
    : block.classList.remove('red_color')
  block.textContent = val == 1 ? 'Secure' : 'Open'
}

function getBlockIdByKey(key) {
  const keyMap = {
    //'xiaomi_A4C13815F71C_temperature': 'bedroom_temperature',
    xiaomi_A4C138E591C5_temperature: 'livingroom_temperature',
  }

  return typeof keyMap[key] != 'undefined' ? keyMap[key] : key
}

document.addEventListener('DOMContentLoaded', function () {
  const refresh = 10000
  fetchStats()
  setInterval(fetchStats, refresh)
  document.querySelector('.time').onclick = fetchStats

  let objektas = {}
  function fetchStats() {
    // fetch("http://localhost:8080/json.php")
    fetch('http://localhost:8080/proxy.php')
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        return response.json()
      })
      .then((json) => {
        const timeBlock = document.querySelector('.time')
        timeBlock.innerText =
          'Last updated ' + json.timestamp + ' (TODO: to seconds)'
        timeBlock.style.display = 'block'
        timeBlock.style.transition = 'all 3s'
        for (const key in json.stats) {
          const block = document.getElementById(getBlockIdByKey(key))
          if (!block) continue

          switch (key) {
            case 'komfovent_mode':
              window['handle_' + key](block, key, json.stats[key])
              continue
              break
            case 'DSCZone_3_Zone_Status':
            case 'DSCZone_6_Zone_Status':
              window['handle_dsc_zones'](block, key, json.stats[key])
              continue
            case 'DSCPartition_1_Partition_Armed_Status':
              window['handle_dsc_status'](block, key, json.stats[key])
              continue
              break
          }

          //get local storage data
          objektas = getLocalStorage('data') || json.stats

          block.textContent = json.stats[key]
          if (!block.classList.contains('trend-ar')) continue
          if (objektas[key]) {
            const trend = block.parentNode.querySelector('.trend')
            const isUp =
              Number.parseFloat(json.stats[key]) >
              Number.parseFloat(objektas[key])
            const isDown =
              Number.parseFloat(json.stats[key]) <
              Number.parseFloat(objektas[key])

            if (isUp || isDown) {
              trend.classList.toggle('up', isUp)
              trend.classList.toggle('down', isDown)
            }
          }
        }

        // set localstorage data
        setLocalStorage('data', json.stats)
      })

      .catch((error) => {
        console.error('Error:', error)
      })
  }
})
