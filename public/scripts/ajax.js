(function ($) {
  "use strict";

  $("[ui-jp], [data-ui-jp]").uiJp();
  $("body").uiInclude();
  $('[data-toggle="tooltip"]').tooltip();

  init();
  function init() {
    $('[data-toggle="tooltip"]').tooltip();
  }

  // pjax
  $(document).on("pjaxStart", function () {
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
      function (event) {
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

    $(document).on("pjax:start", function () {
      $(document).trigger("pjaxStart");
    });
    // fix js
    $(document).on("pjax:end", function (event) {
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
      function () {
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

    $(document).on("click", "#list .item-title", function () {
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

  $(document).on("ready pjax:end", function () {
    if (location.pathname === "/user/wallet/deposits") {
      if (location.hash === '#tab-2') $('a[data-target="#tab-2"]').tab('show')

      $('#paystackForm').submit(function (e) {
        e.preventDefault();
        var $btnSubmit = $("#checkoutBtn");
        var $amtInput = $btnSubmit.prev().find('input')
        var isValid = $amtInput.parsley().isValid()
        const amount = (+$amtInput.val() + (0.0154 * +$amtInput.val() + 100)) * 100
        const name = $(this).find('#name').val()
        const email = $(this).find('#email').val()
        const username = $(this).find('#username').val()
        {
          isValid
            ? $btnSubmit.text("Please wait. Sending data...")
            : $btnSubmit.text("Checkout")
        }
        if (isValid) {
          const data = {
            "email": email,
            "amount": amount,
            "currency": "NGN",
            "metadata": {
              "cancel_action": "https://www.winninglifeinternational.com/user/wallet/deposits#tab-2",
              "username": username,
              "name": name,
              "amount": +$amtInput.val()
            }
          }
          $.ajax({
            url: "https://api.paystack.co/transaction/initialize/",
            type: "POST",
            data: JSON.stringify(data),
            beforeSend: function (xhr) {
              xhr.setRequestHeader("Authorization", "Bearer sk_live_86fa5a492c8b353e91cadd828fb198107db7b833")
              xhr.setRequestHeader("Content-Type", "application/json")
            }
          })
            .then(res => {
              console.log(res)
              location.assign(res.data.authorization_url)
            })
            .fail(err => console.log(err))
        }
      })
    }

    if (location.pathname === "/user/wallet/transfer") {
      $("#formtransfer").submit(function (event) {
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
      $("#formplace").submit(function (event) {
        var me = $(this);
        event.preventDefault();

        if (me.data('requestRunning')) {
          return;
        }

        var $btnSubmit = $("#btnsubmit");
        $btnSubmit.text("Sending data...");
        const placementId = $(this)
          .find("#placementid")
          .val();
        const referralId = $(this)
          .find("#referralid")
          .val();

        me.data('requestRunning', true);

        // Send data to API
        $.ajax({
          url: "/user/placement",
          type: "PUT",
          data: { referralId, placementId },
          complete: function () {
            me.data('requestRunning', false);
          }
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
        $scholarshipEarning - $scholarshipEarning * 0.5;
      const $realTotalAmount =
        +$("#cashEarning").val() +
        $newFoodEarning +
        $newCarEarning +
        $newSuvEarning +
        $newScholarshipEarning;
      console.log($realTotalAmount);
      $totalAmount.val($realTotalAmount);

      // let convertedFood = false;
      // let convertedCar = false;
      // let convertedSuv = false;
      // let convertedScholarship = false;
      $("#foodTrigger").click(function () {
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

      $("#carTrigger").click(function () {
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

      $("#suvTrigger").click(function () {
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

      $("#scholarshipTrigger").click(function () {
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
      $("#refBonusModal .yes").click(function () {
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

      $("#rankEarningWithdrawBtn").click(function () {
        $("#rankEarningModal #withdrawInfo").html(
          `Are you sure to withdraw &#8358; ${$realTotalAmount}?`
        );
      });

      $("#rankEarningModal .yes").click(function () {
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
            new Treant(chart_config, function () {
              $(".loader").remove();
            });
          })
          .fail(err => console.log(err));
      }

      setTimeout(loadMatrix, 2000);
    }

    // Admin

    if (location.pathname === "/admin/users/edit") {
      $("#profileForm .loadUserbtn").click(function () {
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

      $("#securityForm").submit(function (event) {
        var $btnSubmit = $("#btnsubmit");
        $btnSubmit.text("Updating User...");
        const userID = $(this)
          .find("#userid")
          .val();
        const password = $(this)
          .find("#password")
          .val();
        const passwordConf = $(this)
          .find("#passwordconf")
          .val();
        // Send data to API
        $.ajax({
          url: "/admin/users/changepwd",
          type: "PUT",
          data: { userID, password, passwordConf }
        })
          .done(data => {
            $btnSubmit.text("Update");
            var $result = $("#result");
            if (data.startsWith("Error")) {
              $result.removeClass("text-info").addClass("text-danger");
            } else {
              $result.addClass("text-info").removeClass("text-danger");
            }
            $result.text(data).removeClass("hide");
          })
          .fail(err => console.log(err));
        event.preventDefault();
      });

      $("#statusForm .loadUserbtn").click(function () {
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
      $(".loadUserbtn").click(function () {
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
                console.log(data);
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
                new Treant(chart_config, function () {
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
      $(".loadUserbtn").click(function () {
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

    if (
      location.pathname === "/admin/deposits" ||
      location.pathname === "/admin/withdrawals"
    ) {
      function exportTableToCSV($table, filename) {
        var $rows = $table.find("tr:has(td),tr:has(th)"),
          // Temporary delimiter characters unlikely to be typed by keyboard
          // This is to avoid accidentally splitting the actual contents
          tmpColDelim = String.fromCharCode(11), // vertical tab character
          tmpRowDelim = String.fromCharCode(0), // null character
          // actual delimiter characters for CSV format
          colDelim = '","',
          rowDelim = '"\r\n"',
          // Grab text from table into CSV formatted string
          csv =
            '"' +
            $rows
              .map(function (i, row) {
                var $row = $(row),
                  $cols = $row.find("td,th");

                return $cols
                  .map(function (j, col) {
                    var $col = $(col),
                      text = $col.text();

                    return text.replace(/"/g, '""'); // escape double quotes
                  })
                  .get()
                  .join(tmpColDelim);
              })
              .get()
              .join(tmpRowDelim)
              .split(tmpRowDelim)
              .join(rowDelim)
              .split(tmpColDelim)
              .join(colDelim) +
            '"',
          // Data URI
          csvData =
            "data:application/csv;charset=utf-8," + encodeURIComponent(csv);

        if (window.navigator.msSaveBlob) {
          // IE 10+
          //alert('IE' + csv);
          window.navigator.msSaveOrOpenBlob(
            new Blob([csv], { type: "text/plain;charset=utf-8;" }),
            "csvname.csv"
          );
        } else {
          $(this).attr({ download: filename, href: csvData, target: "_blank" });
        }
      }

      $("#deposit-export-btn").click(function (event) {
        exportTableToCSV.apply(this, [
          $("#pending-deposits"),
          `pending-deposits--${new Date().toLocaleDateString()}--${new Date().toLocaleTimeString()}.csv`
        ]);

        // IF CSV, don't do event.preventDefault() or return false
        // We actually need this to be a typical hyperlink
      });

      $("#withdrawal-export-btn").click(function (event) {
        exportTableToCSV.apply(this, [
          $("#pending-withdrawals"),
          `pending-withdrawals--${new Date().toLocaleDateString()}--${new Date().toLocaleTimeString()}.csv`
        ]);

        // IF CSV, don't do event.preventDefault() or return false
        // We actually need this to be a typical hyperlink
      });
    }

    $(".batch-process-btn").hide();

    $(".md-check input:checkbox").change(function () {
      if ($(".md-check input:checkbox:checked").length <= 2) {
        $(".batch-process-btn").hide();
      } else {
        $(".batch-process-btn").show();
      }
    });

    $("#batch-withdrawals-btn").click(function () {
      console.log("batch withdrawals processing");
      let transactions = $(".md-check input:checkbox:checked").serializeArray();
      console.log(transactions);
      $.post("/admin/withdrawals/batch", { data: transactions })
        .done(() => {
          console.log("sent to server");
          location.reload(true);
        })
        .fail(err => console.log(err));
    });

    if (location.pathname === "/admin/users/analysis") {
      $(".loadUserbtn").click(function () {
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

    // Gallery
    if (location.pathname === "/admin/gallery" || location.pathname === "/editor/gallery") {
      var gallery = document.querySelector('#gallery');
      var getVal = function (elem, style) { return parseInt(window.getComputedStyle(elem).getPropertyValue(style)); };
      var getHeight = function (item) { return item.querySelector('.content').getBoundingClientRect().height; };
      var resizeAll = function () {
        var altura = getVal(gallery, 'grid-auto-rows');
        var gap = getVal(gallery, 'grid-row-gap');
        gallery.querySelectorAll('.gallery-item').forEach(function (item) {
          var el = item;
          el.style.gridRowEnd = "span " + Math.ceil((getHeight(item) + gap) / (altura + gap));
        });
      };
      gallery.querySelectorAll('img').forEach(function (item) {
        // item.classList.add('byebye');
        // if (item.complete) {
        //   console.log(item.src);
        // }
        // else {
        item.addEventListener('load', function () {
          var altura = getVal(gallery, 'grid-auto-rows');
          var gap = getVal(gallery, 'grid-row-gap');
          var gitem = item.parentElement.parentElement;
          gitem.style.gridRowEnd = "span " + Math.ceil((getHeight(gitem) + gap) / (altura + gap));
          item.classList.remove('byebye');
        });
        // }
      });
      resizeAll();
      window.addEventListener('resize', resizeAll);
      gallery.querySelectorAll('.gallery-item .content').forEach(function (item) {
        item.addEventListener('click', function () {
          item.parentElement.classList.toggle('full');
        });
      });

      // Handle Batch Delete
      $('#deleteImgs').click(function () {
        let selectedImgs = $(".gallery-item .md-check input:checkbox:checked").serializeArray();
        console.log(selectedImgs);
        $.ajax("/admin/gallery", { method: 'delete', data: selectedImgs })
          .done(() => {
            console.log("removing images");
            location.reload(true);
          })
          .fail(err => console.log(err));
      })
    }

    // Mini Gallery - Landing Page

    if (location.pathname === "/admin/landing" || location.pathname === "/editor/landing") {
      // Handle Batch Delete
      $('#deleteImgs').click(function () {
        let selectedImgs = $(".gallery-item .md-check input:checkbox:checked").serializeArray();
        console.log(selectedImgs);
        $.ajax("/admin/minigallery", { method: 'delete', data: selectedImgs })
          .done(() => {
            console.log("removing images");
            location.reload(true);
          })
          .fail(err => console.log(err));
      })

      $('#video-testimonials #submit').click(function () {
        let $input = $(this).prev()
        const videoID = $input.val()
        $input.val('')
        console.log(videoID)
        $('#links').append(`
          <div class="input-group">
            <input type="text" readonly class="form-control form-control-sm" placeholder="Youtube Video ID"
              required="" value="https://www.youtube-nocookie.com/embed/${videoID}" />
            <span class="input-group-btn"><button class="btn btn-default btn-sm no-shadow" type="button">
                <i class="fa fa-times"></i></button></span>
          </div>
        `)

        $.ajax('/admin/videoTestimonials', {
          method: "POST",
          data: { videoID },
        })
          .then(res => console.log(res))
          .fail(err => console.log(err))
      })

      $('#video-testimonials #links').on('click', 'span', function () {
        let $parentEl = $(this).parent()
        const videoID = $parentEl.find('input').val().substring(39)
        $parentEl.remove()
        $.ajax('/admin/videoTestimonials', {
          method: "DELETE",
          data: { videoID }
        })
          .then(res => console.log(res))
          .fail(err => console.log(err))
      })
    }

    if (location.pathname === '/admin/users/settings') {
      $('.withdraw-switch').change(function () {
        if ($(this).is(":checked")) {
          $.ajax("/admin/users/settings", { method: 'PUT', data: { withdraw: 'true' } })
            .done(() => {
              location.reload(true);
            }).fail(err => console.log(err))
        } else {
          $.ajax("/admin/users/settings", { method: 'PUT', data: { withdraw: 'false' } })
            .done(() => {
              location.reload(true);
            }).fail(err => console.log(err))
        }
      })

      $('.announcement-switch').change(function () {
        if ($(this).is(":checked")) {
          $.ajax("/admin/users/settings", { method: 'PUT', data: { announce: 'true' } })
            .done(() => {
              location.reload(true);
            }).fail(err => console.log(err))
        } else {
          $.ajax("/admin/users/settings", { method: 'PUT', data: { announce: 'false' } })
            .done(() => {
              location.reload(true);
            }).fail(err => console.log(err))
        }
      })
    }

    if (location.pathname === '/admin/contact') {
      let contacts = [], filtered = [];
      let selected;
      let selectedID;

      const calculateSubmissions = () => $('.search p').text(`${filtered.length} submissions`)
      const listSubmissions = () => {
        calculateSubmissions()
        let elements = $()
        elements = filtered.map((submission, index) => elements.add(`
          <li class=${index === selected ? "selected" : null} data-id="${submission._id}">
            <p>${submission.email}</p><p>${new Date(submission.created).toDateString()}</p>
          </li>
        `))
        $('.submissions ul').empty().append(elements)
      }

      const showSubmission = (selected) => {
        $('#right .details').html(`
          <div>
            <div class="controls">
              <button>Delete</button>
            </div>
            <div class="title">
              <div>
                <p class="avatar">${selected.email[0].toUpperCase()}</p>
                <p>${selected.email}</p>
              </div>
              <p>${new Date(selected.created).toDateString()}</p>
            </div>
            <div class="body">
              <div>
                <h4>Name</h4>
                <p>${selected.name}</p>
              </div>
              <div>
                <h4>Email</h4>
                <p>${selected.email}</p>
              </div>
              <div>
                <h4>Phone</h4>
                <p>${selected.phone}</p>
              </div>
              <div>
                <h4>Message</h4>
                <p>${selected.message}</p>
              </div>
            </div>
          </div>
        `)
      }

      const fetchSubmissions = () => {
        $.get('/admin/contacts')
          .done(data => {
            contacts = [...data]
            filtered = [...data]
            listSubmissions()
          }).fail(err => console.log(err))
      }

      fetchSubmissions()

      const filterSubmissions = e => {
        const filteredList = contacts.filter(submission => {
          return submission.email.toLowerCase().includes(e.target.value.toLowerCase())
        })

        filtered = [...filteredList]
        listSubmissions()
      }

      const setSelected = id => {
        selectedID = contacts.findIndex(x => x._id === id)
        selected = contacts[selectedID]
        showSubmission(selected)
      }

      const deleteSubmission = id => {
        let submissionID = contacts[id]._id
        $.ajax('/admin/contact', { method: 'DELETE', data: { id: submissionID } })
          .done(() => {
            $('#right .alert').removeClass('hide')
            $('#right .alert p:first').text('Submission deleted successfully!')
            $('#right .details').html('')
            fetchSubmissions()
          }).fail(err => console.log(err))
      }

      $('#right .alert p:last').click(function () {
        $(this).parent().addClass('hide')
      })

      $('#right .details').on('click', 'button', () => deleteSubmission(selectedID))

      $('.search input').on('input', filterSubmissions)
      $('.submissions ul').on('click', 'li', function () {
        $(this).siblings().removeClass('selected')
        $(this).addClass('selected')
        setSelected($(this).attr('data-id'))
      })
    }

  });
})(jQuery);
