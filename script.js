// const todayElement = document.getElementById('today');
// const today = new Date();
// const options = { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' };
// todayElement.textContent = today.toLocaleDateString('en-EG', options);

// const cityInput = document.querySelector(".city input");
// cityInput.addEventListener("mousedown", () => {
//     cityInput.value = "";
// });

let currentLang = "ar";

function updateDate() {
  const options = { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' };
  const locale = currentLang === "ar" ? "ar-EG" : "en-EG";
  const todayDate = new Date().toLocaleDateString(locale, options);
  document.getElementById("today").textContent = todayDate;
}
updateDate();

const translations = {
  en: {
    fajr: "Fajr",
    sunrise: "Sunrise",
    dhuhr: "Dhuhr",
    asr: "Asr",
    maghrib: "Maghrib",
    isha: "Isha",
    title: "Prayer Times"
  },
  ar: {
    fajr: "الفجر",
    sunrise: "الشروق",
    dhuhr: "الظهر",
    asr: "العصر",
    maghrib: "المغرب",
    isha: "العشاء",
    title: "مواقيت الصلاة"
  }
};
document.getElementById("lang-toggle").addEventListener("click", () => {
  currentLang = currentLang === "en" ? "ar" : "en";
  applyTranslations();
});
function applyTranslations() {
  const t = translations[currentLang];
  document.querySelector("h2").textContent = t.title;
  document.querySelector(".fajr p:first-child").textContent = t.fajr;
  document.querySelector(".sunrise p:first-child").textContent = t.sunrise;
  document.querySelector(".duhr p:first-child").textContent = t.dhuhr;
  document.querySelector(".asr p:first-child").textContent = t.asr;
  document.querySelector(".maghreb p:first-child").textContent = t.maghrib;
  document.querySelector(".isha p:first-child").textContent = t.isha;
  document.getElementById("select-placeholder").textContent =
  currentLang === "ar" ? "الاسماعيلية" : "Ismailia";
  document.body.dir = currentLang === "ar" ? "rtl" : "ltr";
  const cityList = currentLang === "ar" ? citiesAr : cities;

  const citySelect = document.getElementById("cities");
  citySelect.innerHTML = `<option value="" disabled selected id="select-placeholder">${currentLang === "ar" ? "الاسماعيلية" : "Ismailia"}</option>`;

for (let city of cityList) {
    const option = document.createElement("option");
    option.value = city;
    option.textContent = city;
    citySelect.appendChild(option);
}

  document.getElementById("lang-toggle").textContent =
    currentLang === "ar" ? "English" : "العربية";
    updateDate();

  let selectedCity = document.getElementById('cities').value || "Ismailia";
  getPrayerTimeing(selectedCity);
}

let citiesAr = [
    "الإسكندرية", "أسوان", "أسيوط", "البحيرة",
    "بني سويف", "القاهرة", "الدقهلية", "دمياط",
    "الفيوم", "الغربية", "الجيزة", "الإسماعيلية",
    "كفر الشيخ", "الأقصر", "مرسى مطروح", "المنيا",
    "المنوفية", "الوادي الجديد", "شمال سيناء", "بورسعيد",
    "القليوبية", "قنا", "البحر الأحمر", "الشرقية", "سوهاج",
    "جنوب سيناء", "السويس"
];


let cities = [
    "Alexandria", "Aswan", "Asyut", "Beheira",
    "Beni Suef", "Cairo", "Dakahlia", "Damietta",
    "Faiyum", "Gharbia", "Giza", "Ismailia",
    "Kafr El Sheikh", "Luxor", "Matrouh", "Minya",
    "Monufia", "New Valley", "North Sinai", "Port Said",
    "Qalyubia", "Qena", "Red Sea", "Sharqia", "Sohag",
    "South Sinai", "Suez"

]

for (let city of cities) {
    const content = `
    <option>${city}</option>
    `
    document.getElementById('cities').innerHTML += content;
}

document.getElementById('cities').addEventListener('change', function(){
    let selectedCity = this.value
    getPrayerTimeing(selectedCity);
})


function getPrayerTimeing(selectedCity) {

    let params = {
        country: "EG",
        city: selectedCity
    }
    
    axios.get('https://api.aladhan.com/v1/timingsByCity', {
        params:params
      })
        .then((response) => {
            let timings = response.data.data.timings
            setTimings('fajr-time',timings.Fajr)
            setTimings('sunrise-time',timings.Sunrise)
            setTimings('duhr-time',timings.Dhuhr)
            setTimings('asr-time',timings.Asr)
            setTimings('maghreb-time',timings.Maghrib)
            setTimings('isha-time', timings.Isha)
            
            let now = new Date();
            let today = new Date().toISOString().split("T")[0];

            let prayers = ["Fajr", "Dhuhr", "Asr", "Maghrib", "Isha"];
            let nextPrayer = null;
            let diffMinutes = null;

            for (let pray of prayers) {
                let time = timings[pray]; 
                let dateObj = new Date(`${today}T${time}:00`);
                let diff = dateObj - now;

                if (diff > 0) { 
                    nextPrayer = pray;
                    diffMinutes = Math.floor(diff / 1000 / 60);
                    break;
                }
            }

            if (nextPrayer) {
                updateRemainingTime(nextPrayer, diffMinutes);
            } 
            else {

                const tomorrow = new Date();
                tomorrow.setDate(tomorrow.getDate() + 1);
                const tomorrowDateString = tomorrow.toISOString().split("T")[0];

                let paramsTomorrow = {
                    country: "EG",
                    city: selectedCity,
                    date: tomorrowDateString,
                };

                axios.get('https://api.aladhan.com/v1/timingsByCity', { params: paramsTomorrow })
                    .then((response) => {
                        const timingsTomorrow = response.data.data.timings;
                        const fajrTomorrowTime = timingsTomorrow.Fajr;
                        const fajrTomorrowDateObj = new Date(`${tomorrowDateString}T${fajrTomorrowTime}:00`);
                        
                        const now = new Date();
                        const diff = fajrTomorrowDateObj - now;
                        const diffMinutes = Math.floor(diff / 1000 / 60);

                        updateRemainingTime("Fajr", diffMinutes);
                    })
                    .catch((error) => {
                        console.log("Error fetching tomorrow's prayer times:", error);
                    });
}

      })
      .catch((error) => {
        console.log(error);
      })
    
}
setInterval(() => {
    let selectedCity = document.getElementById('cities').value || "Ismailia";
    getPrayerTimeing(selectedCity);
}, 60000);
function setTimings(id, time) {
    document.getElementById(id).innerHTML = time;
}

function formatHoursAr(h) {
    if (h === 1) return "ساعة واحدة";
    if (h === 2) return "ساعتين";
    if (h >= 3 && h <= 10) return `${h} ساعات`;
    return `${h} ساعة`;
}

function formatMinutesAr(m) {
    if (m === 1) return "دقيقة واحدة";
    if (m === 2) return "دقيقتين";
    if (m >= 3 && m <= 10) return `${m} دقائق`;
    return `${m} دقيقة`;
}


function updateRemainingTime(nextPrayer, diffMinutes) {
    if (nextPrayer) {
        let hours = Math.floor(diffMinutes / 60);
        let minutes = diffMinutes % 60;

        const prayerName =
            currentLang === "ar"
                ? translations.ar[nextPrayer.toLowerCase()] || nextPrayer
                : nextPrayer;

        if (currentLang === "ar") {
            let parts = [];
            if (hours > 0) parts.push(formatHoursAr(hours));
            if (minutes > 0) parts.push(formatMinutesAr(minutes));

            document.getElementById("next-pray").textContent = `الصلاة القادمة: ${prayerName}`;
            document.getElementById("remaining-clock").textContent = `باقي ${parts.join(" و ")}`;
        } else {
            let parts = [];
            if (hours > 0) parts.push(`${hours} hour${hours > 1 ? "s" : ""}`);
            if (minutes > 0) parts.push(`${minutes} minute${minutes > 1 ? "s" : ""}`);

            document.getElementById("next-pray").textContent = `Next Prayer: ${prayerName}`;
            document.getElementById("remaining-clock").textContent = `Remaining ${parts.join(" and ")}`;
        }
    } else {
        document.getElementById("next-pray").textContent =
            currentLang === "ar" ? "انتهت" : "Finished";
        document.getElementById("remaining-clock").textContent = "--";
    }
}


getPrayerTimeing("ismailia")
applyTranslations()
