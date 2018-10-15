var quantity = 15;
var max_length = 30;
var full_inf_length = 10;
var IdList = [];
var keywords = '';

showIdList();

function get_url() {
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
    url += "&keywords=" + keywords;
    url += "&itemFilter(0).name=HideDuplicateItems";
    url += "&itemFilter(0).value=true";
    url += "&itemFilter(1).name=ListingType";
    url += "&itemFilter(1).value(0)=AuctionWithBIN";
    url += "&itemFilter(1).value(1)=FixedPrice";
    url += "&itemFilter(2).name=LocatedIn";
    url += "&itemFilter(2).value(0)=US";
    url += "&paginationInput.entriesPerPage=" + quantity;

    return url;
}

function showIdList(root) {
    if (keywords && !$('.button_off_on').hasClass('btn-danger')) {
        real_url = get_url();

        if (document.getElementById('showIdList')) {
            document.getElementById('showIdList').remove();
        }

        s = document.createElement('script');
        s.src = real_url;
        s.id = 'showIdList';
        document.body.appendChild(s);
    }

    setTimeout(function () {
        showIdList(root);
    }, 1000);
}


function _cb_findItemsByKeywords(root) {
    var items = root.findItemsByKeywordsResponse[0].searchResult[0].item || [];
    var updated_elements = [];
    var time_Now = ((new Date().getTime()) - (new Date().getTimezoneOffset()));
    var max_time = 600000;
    var minute = 60000;
    var second = 1000;

    if (!IdList.length) {
        IdList = GetNewIdList(items, 'id_list');
    } else {
        updated_elements = GetNewIdList(items, '');

        for (var i = 0; i < updated_elements.length; i++) {
            var new_Id = '';

            for (var e = 0; e < IdList.length; e++) {
                if (updated_elements[i].itemId[0] == IdList[e].itemId[0]) {
                    new_Id = 'found';
                    break;
                }
            }

            if (!new_Id) {
                if (IdList.length >= max_length)
                    IdList.splice(max_length - 1, 1);

                var time_diff = time_Now - Date.parse(updated_elements[i].listingInfo[0].startTime[0]);

                if (time_diff < max_time) {
                    var minutes,
                        seconds;
                    minutes = Math.floor(time_diff / minute) + ' min';
                    seconds = Math.floor((time_diff % minute) / second) + ' sec';

                    updated_elements[i].timeDif = [minutes + ' : ' + seconds];
                } else {
                    updated_elements[i].timeDif = ['< 10 min'];
                }

                var price;
                if (updated_elements[i].listingInfo[0].listingType[0] === 'AuctionWithBIN')
                    price = updated_elements[i].listingInfo[0].buyItNowPrice[0].__value__;
                else
                    price = updated_elements[i].sellingStatus[0].currentPrice[0].__value__;

                newElemList = '';
                newElemList += '<li class="item product col-md-3 ">';
                newElemList += '<div class="product_container">';
                newElemList += '<a target="_blank" rel="noopener noreferrer" href="' + updated_elements[i].viewItemURL[0] + '" class="woocommerce-LoopProduct-link woocommerce-loop-product__link">';
                newElemList += '<img  src="' + updated_elements[i].galleryURL[0] + '" ></a>';
                newElemList += '<div class="es-product-title-wrap">';
                newElemList += '<a target="_blank" rel="noopener noreferrer" href="' + updated_elements[i].viewItemURL[0] + '">';
                newElemList += '<h2 class="woocommerce-loop-product__title">' + updated_elements[i].title[0] + '</h2></a>';
                newElemList += '<span class="price">$' + price + '</span></div>';
                newElemList += '<div class="es-product-buttons-wrap">';
                newElemList += '<a  href="#" class="add_to_cart_button ">ID: ' + updated_elements[i].itemId[0] + '</a>';
                newElemList += '<a href="#" class="add_to_wishlist">' + updated_elements[i].timeDif[0] + '</a></div>';
                newElemList += '</div>';
                newElemList += '</li>';

                if (updated_elements[i].primaryCategory[0].categoryId[0] === '9355') {
                    IdList.unshift(updated_elements[i]);
                    if (time_diff < max_time)
                        $('.updated_el_list').prepend(newElemList);


                    if (IdList.length > full_inf_length)
                        IdList[full_inf_length] = {'itemId': [IdList[full_inf_length].itemId]};
                }
            }
        }
        console.log(IdList);

        var newHTMLid = [];
        for (var i = 0; i < IdList.length; i++) {
            newHTMLid.push('<span class="Id_List_new">' + IdList[i].itemId[0] + '</span>');
        }
        $(".Id_List").html(newHTMLid.join(""));
    }
}

function GetNewIdList(items, only_id) {
    NewidList = [];

    for (var i = 0; i < items.length; i++) {
        Idarray = {};

        if (only_id === 'id_list')
            Idarray.itemId = items[i].itemId;
        else
            Idarray = items[i];

        NewidList.push(Idarray);
    }
    return NewidList;
}

function get_keywords() {
    keywords = $('.search_input').val();
    error = '';

    if (!keywords) {
        error = 'Keywords are empty!';
        console.log(error);
        $('.search_input').attr('placeholder', error);
    } else
        return keywords;
}

$('.button_status').on('click', function (elem) {
    butt_status = $(elem.target);
    butt_status_id = butt_status.attr('id');

    switch (butt_status_id) {
        case 'butt_start':
            butt_status.attr('id', 'butt_searching');
            butt_status.html('Searching...');
            keywords = get_keywords();
            break;
        case 'butt_start_new':
            keywords = get_keywords();
            butt_status.removeClass('btn-info');
            butt_status.addClass('btn-primary');
            butt_status.attr('id', 'butt_searching');
            butt_status.html('Searching...');
            break;
    }
});

function change_button_launch(remove, add, attr, html) {
    button_off_on_el = $('.button_off_on');

    button_off_on_el.removeClass(remove);
    button_off_on_el.addClass(add);
    button_off_on_el.attr('id', attr);
    button_off_on_el.html(html);
}


$('#butt_off_on').on('click', function () {
    button_off_on_id = $('.button_off_on').attr('id');

    switch (button_off_on_id) {
        case 'butt_off_on':
            change_button_launch('btn-success', 'btn-danger', 'butt_stopped', 'Press to launch');
            $('.button_status').addClass('disabled');
            break;
        case 'butt_stopped':
            change_button_launch('btn-danger', 'btn-success', 'butt_launched', 'Press to stop');
            $('.button_status').removeClass('disabled');
            break;
        case 'butt_launched':
            change_button_launch('btn-success', 'btn-danger', 'butt_stopped', 'Press to launch');
            $('.button_status').addClass('disabled');
            break;
    }
});

$('#butt_start').on('click', function () {
    $('.button_off_on').removeClass('disabled');
});

$('.search_input').on('keypress', function () {
    butt_stat = $('.button_status');

    if (butt_stat.attr('id') != 'butt_start') {
        butt_stat.attr('id', 'butt_start_new');
        butt_stat.removeClass('btn-primary');
        butt_stat.addClass('btn-info');
        butt_stat.html('Start New Search');
        $('.butt_back_sp').html('<button id="butt_back" class="btn btn-dark butt_back ">Back</button>');
        $('.butt_back').on('click', function () {
            butt_stat_new = $('#butt_start_new');

            $('.butt_back').addClass('disabled');
            butt_stat_new.removeClass('btn-info');
            butt_stat_new.addClass('btn-primary');
            butt_stat_new.attr('id', 'butt_searching');
            butt_stat_new.html('Searching...');

            $('.search_input').val(keywords);
        });
        $('#butt_start_new').on('click', function () {
            $('#butt_back').remove();
        });
    }
});