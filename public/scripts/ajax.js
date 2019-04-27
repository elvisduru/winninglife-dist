(function($) {
  "use strict";

  $("[ui-jp], [data-ui-jp]").uiJp();
  $("body").uiInclude();
  $('[data-toggle="tooltip"]').tooltip();

  init();
  function init() {
    $('[data-toggle="tooltip"]').tooltip();
  }

  // pjax
  $(document).on("pjaxStart", function() {
    $("#aside").modal("hide");
    $("body")
      .removeClass("modal-open")
      .find(".modal-backdrop")
      .remove();
    $(".navbar-toggleable-sm").collapse("hide");
  });

  if ($.support.pjax) {
    $.pjax.defaults.maxCacheLength = 0;
    var container = $(".pjax-container");
    $(document).on(
      "click",
      "a[data-pjax], [data-pjax] a, #aside a, .item a",
      function(event) {
        if ($(".pjax-container").length == 0 || $(this).hasClass("no-ajax")) {
          return;
        }
        $.pjax.click(event, {
          container: container,
          timeout: 6000,
          fragment: ".pjax-container"
        });
      }
    );

    $(document).on("pjax:start", function() {
      $(document).trigger("pjaxStart");
    });
    // fix js
    $(document).on("pjax:end", function(event) {
      $(event.target)
        .find("[ui-jp], [data-ui-jp]")
        .uiJp();
      $(event.target).uiInclude();

      $(document).trigger("pjaxEnd");

      init();
    });
  }

  // blockui
  if ($.blockUI) {
    $(document).on(
      "click",
      "#subnav .navside a, #subnav .item-title",
      function() {
        $("#list").block({
          message: '<i class="fa fa-lg fa-refresh fa-spin"></i>',
          css: {
            border: "none",
            backgroundColor: "transparent",
            color: "#fff",
            padding: "30px",
            width: "100%"
          },
          timeout: 1000
        });
      }
    );

    $(document).on("click", "#list .item-title", function() {
      $("#detail").block({
        message: '<i class="fa fa-lg fa-refresh fa-spin"></i>',
        css: {
          border: "none",
          backgroundColor: "transparent",
          color: "#fff",
          padding: "30px",
          width: "100%"
        },
        timeout: 1000
      });
    });
  }

  $(document).on("ready pjax:end", function() {
    if (location.pathname === "/user/wallet/deposits") {
      $("#depositForm").submit(function() {
        alert("Submitted successfully");
      });
    }
    if (location.pathname === "/user/wallet/transfer") {
      $("#formtransfer").submit(function(event) {
        event.preventDefault();
        var $btnSubmit = $("#btnsubmit");
        $btnSubmit.text("Sending data...");
        const username = $(this)
          .find("#username")
          .val();
        const amount = $(this)
          .find("#amount")
          .val();
        // Send data to API
        $.ajax({
          url: "/user/wallet/transfer",
          type: "PUT",
          data: { username, amount }
        })
          .done(data => {
            $btnSubmit.text("Transfer Now? (Not Reversible)");
            var $result = $("#result");
            if (data.startsWith("Error")) {
              $result.removeClass("text-info").addClass("text-danger");
            } else {
              $result.addClass("text-info").removeClass("text-danger");

              // Prepend to history table
              var date = Date.now();
              $("#transferHistory").prepend(`
                  <tr class="cyan">
                    <td>new</td>
                    <td>${amount}</td>
                    <td>${username}</td>
                    <td>${moment(date).fromNow()}</td>
                  </tr>
                  `);
            }
            $result.text(data).removeClass("hide");
          })
          .fail(err => console.log(err));
      });
    }

    if (location.pathname === "/user/placement") {
      $("#formplace").submit(function(event) {
        var $btnSubmit = $("#btnsubmit");
        $btnSubmit.text("Sending data...");
        const placementId = $(this)
          .find("#placementid")
          .val();
        const referralId = $(this)
          .find("#referralid")
          .val();
        // Send data to API
        $.ajax({
          url: "/user/placement",
          type: "PUT",
          data: { referralId, placementId }
        })
          .done(data => {
            $btnSubmit.text("Continue? (Not Reversible)");
            var $result = $("#result");
            if (data.startsWith("Error")) {
              $result.removeClass("text-info").addClass("text-danger");
            } else {
              $result.addClass("text-info").removeClass("text-danger");
            }
            $result.text(data).removeClass("hide");
          })
          .fail(err => console.log(err));
        // return false;
        event.preventDefault();
      });
    }

    if (location.pathname === "/user/wallet/withdrawal") {
      const $totalAmount = $("#totalAmount");
      const $foodEarning = +$("#foodEarning").val();
      const $carEarning = +$("#carEarning").val();
      const $suvEarning = +$("#suvEarning").val();
      const $scholarshipEarning = +$("#scholarshipEarning").val();
      const $newFoodEarning = $foodEarning - $foodEarning * 0.075;
      const $newCarEarning = $carEarning - $carEarning * 0.075;
      const $newSuvEarning = $suvEarning - $suvEarning * 0.075;
      const $newScholarshipEarning =
        $scholarshipEarning - $scholarshipEarning * 0.075;
      const $realTotalAmount =
        $newFoodEarning +
        $newCarEarning +
        $newSuvEarning +
        $newScholarshipEarning;

      $totalAmount.val($realTotalAmount);

      // let convertedFood = false;
      // let convertedCar = false;
      // let convertedSuv = false;
      // let convertedScholarship = false;
      $("#foodTrigger").click(function() {
        if ($(this).is(":checked")) {
          $("#foodEarning").val($newFoodEarning);
          // $totalAmount.val(+$totalAmount.val() + $newFoodEarning);
          // convertedFood = true;
        } else if ($(this).is(":not(:checked)")) {
          $("#foodEarning").val($foodEarning);
          // $totalAmount.val(+$totalAmount.val() - $newFoodEarning);
          // convertedFood = false;
        }
      });

      $("#carTrigger").click(function() {
        if ($(this).is(":checked")) {
          $("#carEarning").val($newCarEarning);
          // $totalAmount.val(+$totalAmount.val() + $newCarEarning);
          // convertedCar = true;
        } else if ($(this).is(":not(:checked)")) {
          $("#carEarning").val($carEarning);
          // $totalAmount.val(+$totalAmount.val() - $newCarEarning);
          // convertedCar = false;
        }
      });

      $("#suvTrigger").click(function() {
        if ($(this).is(":checked")) {
          $("#suvEarning").val($newSuvEarning);
          // $totalAmount.val(+$totalAmount.val() + $newSuvEarning);
          // convertedSuv = true;
        } else if ($(this).is(":not(:checked)")) {
          $("#suvEarning").val($suvEarning);
          // $totalAmount.val(+$totalAmount.val() - $newSuvEarning);
          // convertedSuv = false;
        }
      });

      $("#scholarshipTrigger").click(function() {
        if ($(this).is(":checked")) {
          $("#scholarshipEarning").val($newScholarshipEarning);
          // $totalAmount.val(+$totalAmount.val() + $newScholarshipEarning);
          // convertedScholarship = true;
        } else if ($(this).is(":not(:checked)")) {
          $("#scholarshipEarning").val($scholarshipEarning);
          // $totalAmount.val(+$totalAmount.val() - $newScholarshipEarning);
          // convertedScholarship = false;
        }
      });

      // Process Withdrawals
      $("#refBonusModal .yes").click(function() {
        $.post("/user/wallet/withdrawal/ref")
          .done(data => {
            console.log(data);
            const $result = $("#refResult");
            if (data.startsWith("Error")) {
              $result.removeClass("text-info").addClass("text-danger");
            } else {
              var finalBonus = $("#referralbonus").val();
              $("#referralbonus").val(0);
              $result.addClass("text-info").removeClass("text-danger");
            }
            $result.html(data).removeClass("hide");

            // Prepend to history table
            var date = Date.now();
            $("#withdrawalHistory").prepend(`
                  <tr class="cyan">
                    <td>new</td>
                    <td>Referral</td>
                    <td>${finalBonus}</td>
                    <td><span class="label warning" title="Pending">Pending</span></td>
                    <td>${moment(date).fromNow()}</td>
                  </tr>
                  `);
          })
          .fail(err => console.log(err));
      });

      $("#rankEarningWithdrawBtn").click(function() {
        $("#rankEarningModal #withdrawInfo").html(
          `Are you sure to withdraw &#8358; ${$realTotalAmount}?`
        );
      });

      $("#rankEarningModal .yes").click(function() {
        // $.post("/user/wallet/withdrawal/rank", {
        //   amount: $totalAmount.val(),
        //   convertedFood,
        //   convertedCar,
        //   convertedSuv,
        //   convertedScholarship
        // })
        $.post("/user/wallet/withdrawal/rank", {
          amount: $realTotalAmount
        })
          .done(data => {
            const $result = $("#rankResult");
            if (data.startsWith("Error")) {
              $result.removeClass("text-info").addClass("text-danger");
            } else {
              // var finalAmt = $totalAmount.val();
              $(".currentUserEarnings").text(0);
              $totalAmount.val(0);
              $("#cashEarning").val(0);
              $("#foodEarning").val(0);
              $("#carEarning").val(0);
              $("#suvEarning").val(0);
              $("#scholarshipEarning").val(0);
              // if (convertedFood) {
              //   $(".currentUserEarnings").text(
              //     +$(".currentUserEarnings").text() - $foodEarning
              //   );
              //   $("#foodEarning").val(0);
              // }
              // if (convertedCar) {
              //   $(".currentUserEarnings").text(
              //     +$(".currentUserEarnings").text() - $carEarning
              //   );
              //   $("#carEarning").val(0);
              // }
              // if (convertedSuv) {
              //   $(".currentUserEarnings").text(
              //     +$(".currentUserEarnings").text() - $suvEarning
              //   );
              //   $("#suvEarning").val(0);
              // }
              // if (convertedScholarship) {
              //   $(".currentUserEarnings").text(
              //     +$(".currentUserEarnings").text() - $scholarshipEarning
              //   );
              //   $("#scholarshipEarning").val(0);
              // }
              $result.addClass("text-info").removeClass("text-danger");

              // Prepend to history table
              var date = Date.now();
              $("#withdrawalHistory").prepend(`
                    <tr class="cyan">
                      <td>new</td>
                      <td>Rank</td>
                      <td>${$realTotalAmount}</td>
                      <td><span class="label warning" title="Pending">Pending</span></td>
                      <td>${moment(date).fromNow()}</td>
                    </tr>
                    `);
            }
            $result.html(data).removeClass("hide");
          })
          .fail(err => console.log(err));
      });
    }

    if (location.pathname === "/user/matrix") {
      function loadMatrix() {
        $(".loader").text("Loading...");
        $.get("/user/loadMatrix")
          .then(data => {
            var config = {
              container: "#matrix",

              // animateOnInit: true,

              node: {
                collapsable: true
              },
              animation: {
                nodeAnimation: "easeOutBounce",
                nodeSpeed: 700,
                connectorsAnimation: "bounce",
                connectorsSpeed: 700
              }
            };
            var chart_config = [config, ...data];
            console.log(chart_config);
            // var chart_config = [];
            // chart_config[0] = config;
            // chart_config.concat(data);
            // console.log(chart_config);
            new Treant(chart_config, function() {
              $(".loader").remove();
            });
          })
          .fail(err => console.log(err));
      }

      setTimeout(loadMatrix, 2000);
    }

    // Admin

    if (location.pathname === "/admin/users/edit") {
      $("#profileForm .loadUserbtn").click(function() {
        var username = $(this)
          .siblings(".loadUser")
          .val()
          .trim();
        if (username === "") {
          console.log("No userID");
          alert("No UserID specified!");
        } else {
          $.get(`/admin/users/loadUser?username=${username}`)
            .done(user => {
              $("#fullname").val(user.fullname);
              $("#phone").val(user.phone);
              $("#email").val(user.email);
              $("#bankName").val(user.bankName);
              $("#accountNumber").val(user.accountNumber);
              $("#accountName").val(user.accountName);
            })
            .fail(err => console.log(err));
        }
      });

      $("#statusForm .loadUserbtn").click(function() {
        var username = $(this)
          .siblings(".loadUser")
          .val()
          .trim();
        if (username === "") {
          console.log("No userID");
          alert("No UserID specified!");
        } else {
          $.get(`/admin/users/loadUser?username=${username}`)
            .done(user => {
              if (user.active) {
                $("#currentStatus")
                  .addClass("text-info")
                  .text("Status: Active");
              } else {
                $("#currentStatus")
                  .addClass("text-warning")
                  .text("Status: Inactive");
              }
              $("#currentStatus").removeClass("hide");
            })
            .fail(err => console.log(err));
        }
      });
    }

    if (location.pathname === "/admin/users/matrix") {
      $(".loadUserbtn").click(function() {
        $("#matrix").html("");
        var username = $(this)
          .siblings(".loadUser")
          .val()
          .trim();
        $(this).text("loading...");
        if (username === "") {
          console.log("No userID");
          alert("No UserID specified!");
        } else {
          function loadMatrix() {
            $.get(`/admin/users/loadMatrix?username=${username}`)
              .then(data => {
                var config = {
                  container: "#matrix",

                  node: {
                    collapsable: true
                  },
                  animation: {
                    nodeAnimation: "easeOutBounce",
                    nodeSpeed: 700,
                    connectorsAnimation: "bounce",
                    connectorsSpeed: 700
                  }
                };
                var chart_config = [config, ...data];
                new Treant(chart_config, function() {
                  $(".loadUserbtn").text("Submit");
                });
              })
              .fail(err => console.log(err));
          }

          setTimeout(loadMatrix, 2000);
        }
      });
    }

    if (location.pathname === "/admin/users/members") {
      $(".loadUserbtn").click(function() {
        $("#rankTable").html("");
        var rank = $(this)
          .siblings(".loadRank")
          .val()
          .trim();
        $.get(`/admin/users/loadMembers?rank=${rank}`)
          .then(users => {
            let counter = 1;
            users.forEach(user => {
              $("#rankTable").append(
                `
                      <tr>
                        <td>${counter}</td>
                        <td>${user.username}</td>
                      </tr>
                    `
              );
              counter++;
            });
          })
          .fail(err => console.log(err));
      });
    }

    if (location.pathname === "/admin/users/analysis") {
      $(".loadUserbtn").click(function() {
        // clear all inputs
        var username = $(this)
          .siblings(".loadUser")
          .val()
          .trim();
        if (username === "") {
          console.log("No userID");
          alert("No UserID specified!");
        } else {
          $.get(`/admin/users/loadUser?username=${username}`)
            .done(user => {
              if (user.active) {
                $("#currentStatus")
                  .addClass("text-info")
                  .text("Status: Active");
              } else {
                $("#currentStatus")
                  .addClass("text-warning")
                  .text("Status: Inactive");
              }
              $("#currentStatus").removeClass("hide");

              $("#fullname").val(user.fullname);
              $("#phone").val(user.phone);
              $("#email").val(user.email);
              $("#bankName").val(user.bankName);
              $("#accountNumber").val(user.accountNumber);
              $("#accountName").val(user.accountName);
              $("#gender").val(user.gender);
              if (user.nok) {
                $("#nokfirst").val(user.nok_firstname);
                $("#noklast").val(user.nok_lastname);
                $("#nokphone").val(user.nok_phone);
                $("#nokemail").val(user.nok_email);
                $("#nokrelationship").val(user.nok_relationship);
              } else {
                $("#nokfirst").val("");
                $("#noklast").val("");
                $("#nokphone").val("");
                $("#nokemail").val("");
                $("#nokrelationship").val("");
              }
              $("#deposit").val(user.depositWallet);
              $("#refBonus").val(user.referralBonus);
              $("#cash").val(user.earnings.cash);
              $("#food").val(user.earnings.food);
              $("#car").val(user.earnings.car);
              $("#suv").val(user.earnings.suv);
              $("#scholarship").val(user.earnings.scholarship);
            })
            .fail(err => console.log(err));
        }
      });
    }
  });
})(jQuery);
