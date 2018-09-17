var keyword = 'Iphone 7';
var quantity = 15;
var max_length = 30;
var full_inf_length = 9;
var  IdList = [];

url = "http://svcs.ebay.com/services/search/FindingService/v1";
url += "?OPERATION-NAME=findItemsByKeywords";
url += "&SERVICE-VERSION=2.0.0";
url += "&siteid=EBAY-US";
url += "&SECURITY-APPNAME=-My1Api-PRD-68bb06b1d-2b1daea1";
url += "&GLOBAL-ID=EBAY-US";
url += "&RESPONSE-DATA-FORMAT=JSON";
url += "&callback=_cb_findItemsByKeywords";
url += "&sortOrder=StartTimeNewest";
url += "&REST-PAYLOAD";
url += "&keywords=" + keyword;
url += "&itemFilter.name=HideDuplicateItems";
url += "&itemFilter.value=true";
url += "&paginationInput.entriesPerPage=" + quantity;

// showIdList();

function showIdList(root) {

    if (document.getElementById('showIdList')) {
        document.getElementById('showIdList').remove();
    }

    s = document.createElement('script');
    s.src= url;
    s.id = 'showIdList';
    document.body.appendChild(s);
    setTimeout(function () {
        showIdList(root);
    },2000);
}

function _cb_findItemsByKeywords(root) {
    var items = root.findItemsByKeywordsResponse[0].searchResult[0].item || [];
    var updated_elements = [];
    var time_Now = ((new Date().getTime()) - (new Date().getTimezoneOffset()));
    var max_time = 600000;
    var minute = 60000;
    var second = 1000;

    if (!IdList.length) {
        IdList = ShowNewIdList(items, 'id_list');
    }else {
        updated_elements = ShowNewIdList(items, '');

        for (var i= 0; i < updated_elements.length; i++) {
            var new_Id = '';

            for (var e = 0; e < IdList.length; e++) {
                // console.log(updated_elements[i].itemId + ' --- ' + IdList[e].itemId + (updated_elements[i].itemId[0] == IdList[e].itemId[0]));

                if ( updated_elements[i].itemId[0] == IdList[e].itemId[0] ) {
                    new_Id = 'found';
                    break;
                }
            }

            if ( !new_Id ) {
                if (IdList.length >= max_length )
                    IdList.splice(max_length-1, 1);


                var time_diff = time_Now - Date.parse(updated_elements[i].listingInfo[0].startTime[0]);
                // console.log(time_diff);

                if (time_diff < max_time ){
                    var minutes,
                        seconds;
                    minutes = Math.floor(time_diff/minute) + ' min';
                    seconds = Math.floor((time_diff % minute)/second) + ' sec';

                    updated_elements[i].timeDif = [minutes + ' : ' + seconds];
                } else {
                    updated_elements[i].timeDif = ['< 10 min']
                }

                IdList.unshift(updated_elements[i]);
                $('.updated_el_list').prepend('<span>' + updated_elements[i].itemId + '  ' + '</span>');

                if (IdList.length > full_inf_length)
                    IdList[full_inf_length] = {'itemId': [IdList[full_inf_length].itemId]};
            }

        }
        console.log(IdList);
        var newHTML = [];
        for (var i = 0; i < IdList.length; i++) {
            newHTML.push('<span>' + IdList[i].itemId[0] + '</span>' + '<br>');
        }
        $(".Id_List").html(newHTML.join(""));

    }
}

function ShowNewIdList(items, only_id) {
    NewidList = [];

    for ( var i = 0; i < items.length; i++){
        Idarray = {};

        if (only_id === 'id_list')
            Idarray.itemId = items[i].itemId;
        else
            Idarray = items[i];

        NewidList.push(Idarray);
    }
    return NewidList;
}
