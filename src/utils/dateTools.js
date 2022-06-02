import { isYesterday, addDays, isTomorrow } from 'date-fns'
let dateTools = {}

dateTools.getNowDate = getNowDate;
dateTools.formatDate = formatDate;
dateTools.getAroundDate = getAroundDate;

export default dateTools;

function getNowDate(connect_str='-'){
    let _date = new Date();
    let year = _date.getFullYear();
    let month = _date.getMonth()+1;
    let day = _date.getDate();
    let hour = _date.getHours();
    let minute = _date.getMinutes();
    let second = _date.getSeconds();

    let specific_time = formatDate(year, month, day, connect_str, hour, minute, second);
    let date = formatDate(year, month, day, connect_str);
    const result = {
        year: year,
        month: month,
        day: day,
        hour: hour,
        minute: minute,
        second: second,
        specific_time: specific_time,
        date : date,
    }
    return result;
}

function formatDate(year, month, day, connect_str='-', hour=-1, minute=-1, second=-1){
    if(month<10){
        month = "0"+month;
    }
    if(day<10){
        day = "0"+day;
    }
    let _specific_time = ""

    if(second > 0){
        if(hour<10){
            hour = "0"+hour;
        }
        if(minute<10){
            minute = "0"+minute;
        }
        if(second<10){
            second = "0"+second;
        }
        _specific_time =' '+hour+":"+minute+":"+second;
    }
    return year+connect_str+month+connect_str+day + _specific_time;
}

function getAroundDate(_date, gap, connect_str='-'){

	if(typeof(_date) == "string"){
		_date = new Date(_date);
	}
	let new_date = addDays(_date.getTime(), gap);
	return formatDate(new_date.getFullYear(), new_date.getMonth()+1, new_date.getDate(), connect_str=connect_str);
}
