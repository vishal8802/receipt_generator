$.post(
  "/upload",
  {
    name: $("#name").val(),
    address: $("#address").val(),
    amount: $("#amount").val(),
    number: $("#invoice_id").val()
  },
  data => {
    console.log(data);
  }
);
