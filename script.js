$(document).ready(function () {

    $("#darkModeBtn").click(function () {
        $("body").toggleClass("dark-mode");

        const icon = $(this).find("i");

        if ($("body").hasClass("dark-mode")) {
            icon.removeClass("bi-moon-fill").addClass("bi-sun-fill");
        } else {
            icon.removeClass("bi-sun-fill").addClass("bi-moon-fill");
        }
    });

    $("#useBirthTime").change(function () {
        if ($(this).is(":checked")) {
            $("#birthTimeArea").removeClass("d-none");
            $("#birthTime").attr("required", true);
        } else {
            $("#birthTimeArea").addClass("d-none");
            $("#birthTime").removeAttr("required");
            $("#birthTime").val("");
        }
    });

    $("#useCustomDate").change(function () {
        if ($(this).is(":checked")) {
            $("#customDateArea").removeClass("d-none");
            $("#customDate").attr("required", true);
        } else {
            $("#customDateArea").addClass("d-none");
            $("#customDate").removeAttr("required");
            $("#customDate").val("");
            $("#customTime").val("");
        }
    });

    $("#resetBtn").click(function () {
        $("#birthTimeArea").addClass("d-none");
        $("#customDateArea").addClass("d-none");

        $("#useBirthTime").prop("checked", false);
        $("#useCustomDate").prop("checked", false);

        $("#birthTime").removeAttr("required");
        $("#customDate").removeAttr("required");

        $("#resultArea").addClass("d-none");
        $("#errorArea").addClass("d-none").text("");
    });

    $("#ageForm").submit(function (e) {
        e.preventDefault();

        $("#errorArea").addClass("d-none").text("");
        $("#resultArea").addClass("d-none");

        let birthDateValue = $("#birthDate").val();
        let birthTimeValue = $("#birthTime").val();

        let useBirthTime = $("#useBirthTime").is(":checked");
        let useCustomDate = $("#useCustomDate").is(":checked");

        let customDateValue = $("#customDate").val();
        let customTimeValue = $("#customTime").val();

        if (birthDateValue === "") {
            showError("Lütfen doğum tarihinizi giriniz.");
            return;
        }

        if (useBirthTime && birthTimeValue === "") {
            showError("Lütfen doğum saatinizi giriniz.");
            return;
        }

        if (useCustomDate && customDateValue === "") {
            showError("Lütfen hesaplama tarihini giriniz.");
            return;
        }

        let birthDateTime;
        let calculationDateTime;

        if (useBirthTime) {
            birthDateTime = new Date(birthDateValue + "T" + birthTimeValue);
        } else {
            birthDateTime = new Date(birthDateValue + "T00:00");
        }

        if (useCustomDate) {
            if (customTimeValue !== "") {
                calculationDateTime = new Date(customDateValue + "T" + customTimeValue);
            } else {
                calculationDateTime = new Date(customDateValue + "T00:00");
            }
        } else {
            calculationDateTime = new Date();
        }

        if (birthDateTime > calculationDateTime) {
            showError("Doğum tarihi, hesaplama tarihinden ileri olamaz.");
            return;
        }

        let result = calculateAgeDetails(birthDateTime, calculationDateTime, useBirthTime);

        $("#mainAge").text(result.age + " yaşındasınız.");

        $("#lastBirthdayPassed").text(
            formatDuration(result.afterLastBirthday, useBirthTime) + " geçti."
        );

        $("#nextBirthdayRemaining").text(
            formatDuration(result.beforeNextBirthday, useBirthTime) + " kaldı."
        );

        $("#ageStatus").text(
            result.age + " yaşınızı doldurdunuz. " +
            (result.age + 1) + " yaşınızdan gün alıyorsunuz."
        );

        $("#birthDayName").text(
            "Bir " + result.birthDayName + " günü doğdunuz."
        );

        $("#zodiacSign").text(result.zodiacSign);

        $("#totalDays").text(
            "Toplam " + formatNumber(result.totalDays) + " gün yaşadınız."
        );

        $("#totalHours").text(
            "Toplam " + formatNumber(result.totalHours) + " saat yaşadınız."
        );

        $("#totalMinutes").text(
            "Toplam " + formatNumber(result.totalMinutes) + " dakika yaşadınız."
        );

        if (useBirthTime) {
            $(".time-detail").show();
        } else {
            $(".time-detail").hide();
        }

        $("#resultArea").removeClass("d-none");
    });

    function calculateAgeDetails(birthDate, calculationDate, useBirthTime) {
        let age = calculationDate.getFullYear() - birthDate.getFullYear();

        let birthdayThisYear = new Date(
            calculationDate.getFullYear(),
            birthDate.getMonth(),
            birthDate.getDate(),
            useBirthTime ? birthDate.getHours() : 0,
            useBirthTime ? birthDate.getMinutes() : 0
        );

        if (calculationDate < birthdayThisYear) {
            age--;
        }

        let lastBirthday = new Date(
            calculationDate.getFullYear(),
            birthDate.getMonth(),
            birthDate.getDate(),
            useBirthTime ? birthDate.getHours() : 0,
            useBirthTime ? birthDate.getMinutes() : 0
        );

        if (calculationDate < lastBirthday) {
            lastBirthday.setFullYear(lastBirthday.getFullYear() - 1);
        }

        let nextBirthday = new Date(lastBirthday);
        nextBirthday.setFullYear(nextBirthday.getFullYear() + 1);

        let afterLastBirthday = getDateDifference(lastBirthday, calculationDate, useBirthTime);
        let beforeNextBirthday = getDateDifference(calculationDate, nextBirthday, useBirthTime);

        let totalMs = calculationDate - birthDate;
        let totalDays = Math.floor(totalMs / (1000 * 60 * 60 * 24));
        let totalHours = Math.floor(totalMs / (1000 * 60 * 60));
        let totalMinutes = Math.floor(totalMs / (1000 * 60));

        let birthDayName = getTurkishDayName(birthDate.getDay());
        let zodiacSign = getZodiacSign(birthDate.getDate(), birthDate.getMonth() + 1);

        return {
            age: age,
            afterLastBirthday: afterLastBirthday,
            beforeNextBirthday: beforeNextBirthday,
            totalDays: totalDays,
            totalHours: totalHours,
            totalMinutes: totalMinutes,
            birthDayName: birthDayName,
            zodiacSign: zodiacSign
        };
    }

    function getDateDifference(startDate, endDate, useTime) {
        let years = endDate.getFullYear() - startDate.getFullYear();
        let months = endDate.getMonth() - startDate.getMonth();
        let days = endDate.getDate() - startDate.getDate();
        let hours = endDate.getHours() - startDate.getHours();
        let minutes = endDate.getMinutes() - startDate.getMinutes();

        if (!useTime) {
            hours = 0;
            minutes = 0;
        }

        if (useTime && minutes < 0) {
            minutes += 60;
            hours--;
        }

        if (useTime && hours < 0) {
            hours += 24;
            days--;
        }

        if (days < 0) {
            months--;

            let previousMonthLastDay = new Date(
                endDate.getFullYear(),
                endDate.getMonth(),
                0
            ).getDate();

            days += previousMonthLastDay;
        }

        if (months < 0) {
            years--;
            months += 12;
        }

        return {
            years: years,
            months: months,
            days: days,
            hours: hours,
            minutes: minutes
        };
    }

    function formatDuration(duration, useTime) {
        let parts = [];

        if (duration.months > 0) {
            parts.push(duration.months + " ay");
        }

        if (duration.days > 0) {
            parts.push(duration.days + " gün");
        }

        if (useTime && duration.hours > 0) {
            parts.push(duration.hours + " saat");
        }

        if (useTime && duration.minutes > 0) {
            parts.push(duration.minutes + " dakika");
        }

        if (parts.length === 0) {
            if (useTime) {
                return "0 dakika";
            } else {
                return "0 gün";
            }
        }

        return parts.join(", ");
    }

    function getTurkishDayName(dayIndex) {
        let days = [
            "Pazar",
            "Pazartesi",
            "Salı",
            "Çarşamba",
            "Perşembe",
            "Cuma",
            "Cumartesi"
        ];

        return days[dayIndex];
    }

    function getZodiacSign(day, month) {
        if ((month === 3 && day >= 21) || (month === 4 && day <= 20)) {
            return "Koç";
        } else if ((month === 4 && day >= 21) || (month === 5 && day <= 21)) {
            return "Boğa";
        } else if ((month === 5 && day >= 22) || (month === 6 && day <= 22)) {
            return "İkizler";
        } else if ((month === 6 && day >= 23) || (month === 7 && day <= 22)) {
            return "Yengeç";
        } else if ((month === 7 && day >= 23) || (month === 8 && day <= 22)) {
            return "Aslan";
        } else if ((month === 8 && day >= 23) || (month === 9 && day <= 22)) {
            return "Başak";
        } else if ((month === 9 && day >= 23) || (month === 10 && day <= 22)) {
            return "Terazi";
        } else if ((month === 10 && day >= 23) || (month === 11 && day <= 21)) {
            return "Akrep";
        } else if ((month === 11 && day >= 22) || (month === 12 && day <= 21)) {
            return "Yay";
        } else if ((month === 12 && day >= 22) || (month === 1 && day <= 21)) {
            return "Oğlak";
        } else if ((month === 1 && day >= 22) || (month === 2 && day <= 19)) {
            return "Kova";
        } else {
            return "Balık";
        }
    }

    function formatNumber(number) {
        return number.toLocaleString("tr-TR");
    }

    function showError(message) {
        $("#errorArea").removeClass("d-none").text(message);
    }

});