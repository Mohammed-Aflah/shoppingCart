function addToCart(proId) {
  $.ajax({
    url: /add-to-cart/ + proId,
    method: "get",
    success: (res) => {
      if (res.status) {
        let count = $("#c").html();
        count = parseInt(count) + 1;
        $("#c").html(count);
      }
    },
  });
}
