function getHoursOptions(){
    alert('toto');
    var result = [];

    function addZero(i) {
        if (i < 10) {
            i = "0" + i;
        }
        return i;
    }

    for(var i = 0; i < 24; i++){
        result.push(addZero(i));
    }

    return result;
};