document.addEventListener("DOMContentLoaded", function () {
  const refresh = 5000;
  fetchStats();
  timer();
  setInterval(fetchStats, refresh);

  function timer() {
    let i = refresh;
    const intervalId = setInterval(() => {
      const timeBlock = document.querySelector(".time");
      timeBlock.style.display = "block";
      timeBlock.style.transition = "all 3s";
      i -= 1000;
      timeBlock.innerHTML = `Update after 
      ${i.toString().slice(0, -3)} seconds`;
      if (i === 0) {
        clearInterval(intervalId);
        document.querySelector(
          ".time"
        ).innerHTML = `<img src="ref.gif" alt="" width="20px">
        `;

        timer();
      }
    }, 1000);
  }

  function fetchStats() {
    fetch("http://server.digroupinc.com/s/")
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then((json) => {
        // const forTrends = [
        //   json.nibe_degree_minutes,
        //   json.xiaomi_A4C13815F71C_temperature,
        // ];git
        trendCheck();
        function trendCheck() {
          const dataNew = Number.parseFloat(json.nibe_degree_minutes);
          const dataOld = Number.parseFloat(
            document.getElementById("nibe_degree_minutes").textContent
          );
          const trend = document.querySelector(".trend");
          trend.classList.toggle("up", dataNew > dataOld);
          trend.classList.toggle("down", dataNew <= dataOld);
        }

        const statusFunctions = {
          DSCPartition_1_Partition_Armed_Status: (section, value) => {
            section.classList.add(value === "1" ? "green_color" : "red_color");
            section.textContent = value === "1" ? "Armed" : "To arm";
          },
          DSCZone_3_Zone_Status: (section, value) => {
            section.classList.add(value === "1" ? "red_color" : "green_color");
            section.textContent = value === "1" ? "Open" : "Closed";
          },
          DSCZone_6_Zone_Status: (section, value) => {
            section.classList.add(value === "1" ? "red_color" : "green_color");
            section.textContent = value === "1" ? "Open" : "Closed";
          },
        };

        const mappedStats = {
          ...json,
          power_from_network: Number.parseFloat(
            json.power_from_network
          ).toFixed(2),
          fronius_acbridge_poweractive_sum_mean_f32: Number.parseFloat(
            json.fronius_acbridge_poweractive_sum_mean_f32
          ).toFixed(2),
          generated_power: Number.parseFloat(json.generated_power).toFixed(2),
          power_to_network: Number.parseFloat(json.power_to_network).toFixed(2),
        };

        for (const [key, value] of Object.entries(mappedStats)) {
          const section = document.getElementById(key);
          if (section && statusFunctions[key]) {
            statusFunctions[key](section, value);
          } else if (section) {
            section.textContent = value;
          }
        }
      })

      .catch((error) => {
        console.error("Error:", error);
      });
  }
});
