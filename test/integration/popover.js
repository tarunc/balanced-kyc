module('Popover');

function openPopover() {
	$('.application-type .person').trigger('click');
	$('[data-toggle="popover"]').first().popover('show');
}

test('exist on page', function(assert) {
	ok($('.icon-tooltip').filter('[data-toggle="popover"]').length >= 2);
});

test('to open', function(assert) {
	openPopover();

	ok($('.popover-content').filter(':visible').length >= 1);
	ok($('.check_image_tool_tip').filter(':visible').length >= 1);
});

test('to stay open when clicked on', function(assert) {
	$('.check_image_tool_tip').filter(':visible').click();

	ok($('.popover-content').filter(':visible').length >= 1);
	ok($('.check_image_tool_tip').filter(':visible').length >= 1);
});

// test('to close when not clicked on', function(assert) {
// 	$(document.body).click();
//
// 	equal($('.popover-content').filter(':visible').length, 0);
// 	equal($('.check_image_tool_tip').filter(':visible').length, 0);
// });
