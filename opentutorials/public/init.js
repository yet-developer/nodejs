$(document).ready(function() {
    $('select').material_select();
    $('.modal-trigger').leanModal();

    $('.datepicker').pickadate({
        selectMonths: true, // Creates a dropdown to control month
        selectYears: 15 // Creates a dropdown of 15 years to control year
    });

    $('.grid').isotope({
        itemSelector: '.grid-item',

        // 나중에 디자인 쪽에서 필요한 경우, gutter를 추가하자.
        // masonry: {
        //     columnWidth: 10,
        //     gutter: 5
        // }
    });

    $('.rating').click(function(){
        var favorite = $(this).text();

        if (favorite != "favorite_border") {
            $(this).text('favorite_border');
        } else {
            $(this).text('favorite');
        }

    });


});
