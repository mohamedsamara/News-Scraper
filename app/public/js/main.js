$(document).ready(function() {
  $('#scrape-btn').on('click', function() {
    $.ajax({
      method: 'GET',
      url: '/scrape'
    }).done(function(data) {
      console.log(data);
      window.location = '/';
    });
  });

  $('#btn-delete').on('click', function() {
    var id = $(this).attr('data-id');
    $.ajax({
      method: 'POST',
      url: '/article/delete/' + id
    }).done(function(data) {
      window.location = '/saved';
    });
  });

  $('#delete-comment').on('click', function() {
    var commentId = $(this).attr('data-comment');
    var articleId = $(this).attr('data-article');
    $.ajax({
      method: 'DELETE',
      url: '/comment/delete/' + commentId + '/' + articleId
    }).done(function(data) {
      console.log(data);
      window.location = '/saved';
    });
  });
});
