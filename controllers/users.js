"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.register = register;
exports.getDeposits = getDeposits;
exports.getTransfers = getTransfers;
exports.getWithdrawals = getWithdrawals;
exports.getEarnings = getEarnings;
exports.transferFund = transferFund;
exports.placeUser = placeUser;
exports.graphUser = graphUser;
exports.deposit = deposit;
exports.cancelDeposit = cancelDeposit;
exports.updateProfile = updateProfile;
exports.withdrawRefBonus = withdrawRefBonus;
exports.withdrawRankEarning = withdrawRankEarning;
exports.userMatrix = userMatrix;
exports.logout = logout;

var _models = require("../models/");

var _passport = _interopRequireDefault(require("passport"));

function _interopRequireDefault(obj) {
  return obj && obj.__esModule ? obj : { default: obj };
}

async function register(req, res) {
  if (req.body.username && req.body.email && req.body.password) {
    const { email, username, password, fullname, phone, gender } = req.body;

    try {
      const foundUser = await _models.User.findOne({ username: username });

      if (foundUser) {
        console.log('User already created');
        res.redirect('back');
      } else {
        const user = new _models.User({
          email,
          username,
          fullname,
          phone,
          gender
        });
        await user.setPassword(password);
        await user.save();

        _passport.default.authenticate("user")(req, res, () => {
          res.status(201).redirect("/user/profile");
        });
      }
    } catch (err) {
      res.status(500).send({
        err
      });
    }
  } else {
    res.status(500).send({
      err: "Something is wrong with your input!"
    });
  }
}

async function getDeposits(req, res) {
  try {
    const deposits = await _models.Deposit.find({
      depositor: req.user.id
    }).sort({
      createdAt: -1
    });
    res.render("Dashboard/deposits", {
      deposits,
      message: req.flash("msg")
    });
  } catch (err) {
    res.send(err);
  }
}

async function getTransfers(req, res) {
  try {
    const transfers = await _models.Transfer.find({
      from: req.user.username
    }).sort({
      created: -1
    });
    res.render("Dashboard/transfer", {
      transfers
    });
  } catch (err) {
    res.send(err);
  }
}

async function getWithdrawals(req, res) {
  try {
    const withdrawals = await _models.Withdraw.find({
      withdrawer: req.user.id
    }).sort({
      createdAt: -1
    });
    res.render("Dashboard/withdrawal", {
      withdrawals
    });
  } catch (err) {
    res.send(err);
  }
}

async function getEarnings(req, res) {
  try {
    const rankEarnings = await _models.RankEarning.find({
      recipient: req.user.username
    }).sort({
      created: -1
    });
    const refEarnings = await _models.RefEarning.find({
      recipient: req.user.username
    }).sort({
      created: -1
    });
    res.render("Dashboard/earnings", {
      rankEarnings,
      refEarnings
    });
  } catch (err) {
    res.send(err);
  }
}

async function transferFund(req, res) {
  if (req.body.amount && req.body.username) {
    try {
      if (req.body.amount > req.user.depositWallet) {
        throw "Error: Insufficient Funds in Wallet!";
      } else {
        const fundedUser = await _models.User.findOneAndUpdate(
          {
            username: req.body.username
          },
          {
            $inc: {
              depositWallet: req.body.amount
            }
          }
        );

        if (!fundedUser) {
          throw "Error: No User found with such ID";
        }

        const transfer = new _models.Transfer({
          from: req.user.username,
          to: req.body.username,
          amount: req.body.amount
        });
        await transfer.save();
        await _models.User.update(
          {
            _id: req.user.id
          },
          {
            $inc: {
              depositWallet: -req.body.amount
            }
          }
        );
        res
          .status(200)
          .send(
            `Successfully transfered ${req.body.amount} to ${
            fundedUser.username
            }`
          );
      }
    } catch (err) {
      res.send(err);
    }
  } else {
    res.send("Error: Something is wrong with your input!");
  }
}

async function placeUser(req, res) {
  if (req.body.referralId && req.body.placementId) {
    try {
      // check if placement is current user
      if (
        req.body.referralId === req.user.username ||
        req.body.placementId === req.user.username
      ) {
        throw "Error: You cannot place yourself under yourself!";
      }

      if (req.user.parent) {
        throw `Error: You have already been placed under ${req.user.parent}`;
      }

      if (req.user.depositWallet < 9000) {
        throw "Error: You do not have enough funds.";
      }

      if (req.user.parent === req.body.placementId) {
        throw "Error: You have already been placed under this user.";
      }

      if (req.user.referrer) {
        throw "Error: You already have a referrer"
      }

      // Referral Bonus to Referrer

      const referrer = await _models.User.findOneAndUpdate(
        {
          username: req.body.referralId
        },
        {
          $inc: {
            referralBonus: 1000
          }
        }
      ); // Find Placement

      const placement = await _models.User.findOne({
        username: req.body.placementId
      });

      if (!referrer || !placement) {
        throw "Error: No User found with such ID";
      }

      const refEarning = new _models.RefEarning({
        recipient: req.body.referralId,
        from: req.user.username
      });
      await refEarning.save(); // User Placement

      if (placement.children.length < 4) {
        placement.children.push(req.user.username);
        placement.downlines++;

        if (placement.downlines === 4) {
          placement.rank = "SilverLife";
          placement.earnings.cash += 3000;
          placement.earnings.food += 2000;
          placement.level = {
            position: 1,
            paid: true
          };
          placement.nextlevel++;
          const rankEarning = new _models.RankEarning({
            recipient: placement.username,
            amount: 5000,
            rank: "SilverLife"
          });
          await rankEarning.save();
        }

        await placement.save();
      } else {
        if (req.body.referralId === req.body.placementId) {
          await _models.User.findOneAndUpdate(
            {
              username: req.body.referralId
            },
            {
              $inc: {
                referralBonus: -1000
              }
            }
          );
        }

        throw "Error: This User already has four downlines";
      }

      await _models.User.findOneAndUpdate(
        {
          _id: req.user.id
        },
        {
          $set: {
            parent: req.body.placementId,
            referrer: req.body.referralId
          },
          $inc: {
            depositWallet: -9000
          }
        }
      );

      res.status(200).send(`Successfully placed under ${placement.username}`);
    } catch (err) {
      res.send(err);
    }
  } else {
    res.send("Error: Something is wrong with your input!");
  }
}

async function fetchLevel(num, username) {
  let levelSum = await _models.User.aggregate()
    .match({
      username: username
    })
    .graphLookup({
      from: "users",
      startWith: "$username",
      connectFromField: "username",
      connectToField: "parent",
      depthField: "depth",
      as: "descendants"
    })
    .unwind("$descendants")
    .match({
      "descendants.depth": num
    })
    .group({
      _id: null,
      count: {
        $sum: 1
      }
    });

  return levelSum[0];
}

async function graphUser(req, res) {
  try {
    let emptyLevel = false;
    let levels = [];
    let levelsProcessed = 0;
    let lastCompleteLevel;

    while (!emptyLevel) {
      await fetchLevel(levelsProcessed, req.user.username)
        .then(level => {
          if (level === undefined) {
            levelsProcessed = 0;
            emptyLevel = true;
          } else {
            levels.push(level.count);
            levelsProcessed++;
          }
        })
        .catch(err => console.log(err));
    }

    if (levels.length) {
      lastCompleteLevel = levels[0];
      for (let i = 1; i < levels.length; i++) {
        if (levels[i] > lastCompleteLevel) {
          lastCompleteLevel = levels[i];
        }
      }
      console.log(levels, lastCompleteLevel);

      if (levels[0] === 4 && req.user.nextlevel === 1) {
        req.user.rank = "SilverLife";
        req.user.earnings.cash += 3000;
        req.user.earnings.food += 2000;
        req.user.level = {
          position: 1,
          paid: true
        };
        req.user.nextlevel++;
        await req.user.save();
        const rankEarning = new _models.RankEarning({
          recipient: req.user.username,
          amount: 5000,
          rank: "SilverLife"
        });
        await rankEarning.save();
      }

      if (levels[1] === 16 && req.user.nextlevel === 2) {
        req.user.rank = "GoldLife 1";
        req.user.earnings.cash += 30000;
        req.user.earnings.food += 10000;
        req.user.level = {
          position: 2,
          paid: true
        };
        req.user.nextlevel++;
        await req.user.save();
        const rankEarning = new _models.RankEarning({
          recipient: req.user.username,
          amount: 40000,
          rank: "GoldLife 1"
        });
        await rankEarning.save();
      }

      if (levels[2] === 64 && req.user.nextlevel === 3) {
        req.user.rank = "GoldLife 2";
        req.user.earnings.cash += 60000;
        req.user.earnings.food += 12000;
        req.user.level = {
          position: 3,
          paid: true
        };
        req.user.nextlevel++;
        await req.user.save();
        const rankEarning = new _models.RankEarning({
          recipient: req.user.username,
          amount: 72000,
          rank: "GoldLife 2"
        });
        await rankEarning.save();
      }

      if (levels[3] === 256 && req.user.nextlevel === 4) {
        req.user.rank = "DiamondLife 1";
        req.user.earnings.cash += 120000;
        req.user.earnings.food += 30000;
        req.user.level = {
          position: 4,
          paid: true
        };
        req.user.nextlevel++;
        await req.user.save();
        const rankEarning = new _models.RankEarning({
          recipient: req.user.username,
          amount: 150000,
          rank: "DiamondLife 1"
        });
        await rankEarning.save();
      }

      if (levels[4] === 1024 && req.user.nextlevel === 5) {
        req.user.rank = "DiamondLife 2";
        req.user.earnings.cash += 250000;
        req.user.earnings.food += 50000;
        req.user.level = {
          position: 5,
          paid: true
        };
        req.user.nextlevel++;
        await req.user.save();
        const rankEarning = new _models.RankEarning({
          recipient: req.user.username,
          amount: 300000,
          rank: "DiamondLife 2"
        });
        await rankEarning.save();
      } // TODO: Monthly increment of Food Bonus

      if (levels[5] === 4096 && req.user.nextlevel === 6) {
        req.user.rank = "SapphireLife 1";
        req.user.earnings.cash += 350000;
        req.user.earnings.food += 250000;
        req.user.level = {
          position: 6,
          paid: true
        };
        req.user.nextlevel++;
        await req.user.save();
        const rankEarning = new _models.RankEarning({
          recipient: req.user.username,
          amount: 700000,
          rank: "SapphireLife 1"
        });
        await rankEarning.save();
      } // TODO: Monthly appreciation bonus of 100000 for 5 months

      if (levels[6] === 16384 && req.user.nextlevel === 7) {
        req.user.rank = "SapphireLife 2";
        req.user.earnings.cash += 1000000;
        req.user.earnings.food += 500000;
        req.user.level = {
          position: 7,
          paid: true
        };
        req.user.nextlevel++;
        await req.user.save();
        const rankEarning = new _models.RankEarning({
          recipient: req.user.username,
          amount: 1500000,
          rank: "SapphireLife 2"
        });
        await rankEarning.save();
      }

      if (levels[7] === 65536 && req.user.nextlevel === 8) {
        req.user.rank = "EmeraldLife 1";
        req.user.earnings.cash += 1000000;
        req.user.earnings.car += 4500000;
        req.user.level = {
          position: 8,
          paid: true
        };
        req.user.nextlevel++;
        await req.user.save();
        const rankEarning = new _models.RankEarning({
          recipient: req.user.username,
          amount: 6500000,
          rank: "EmeraldLife 1"
        });
        await rankEarning.save();
      } // if (lastCompleteLevel === 262144 &&
      // req.user.nextlevel === 9) {
      // 	req.user.rank = 'EmeraldLife'
      // 	req.user.earnings.suv += 15000000;
      // 	req.user.earnings.sholarship += 1000000;
      // 	req.user.level = {
      // 		position: 6,
      // 		paid: true
      // 	}
      // req.user.nextlevel++;
      // 	await req.user.save()
      // }
    } else {
      console.log("None");
    }
    // if (req.user.level.paid) {
    //   const levelCount = await _models.User.aggregate()
    //     .match({
    //       username: req.user.username
    //     })
    //     .graphLookup({
    //       from: "users",
    //       startWith: "$username",
    //       connectFromField: "username",
    //       connectToField: "parent",
    //       depthField: "depth",
    //       as: "descendants"
    //     })
    //     .unwind("$descendants")
    //     .match({
    //       "descendants.depth": req.user.nextlevel - 1
    //     })
    //     .group({
    //       _id: null,
    //       count: {
    //         $sum: 1
    //       }
    //     });

    //   if (levelCount.length > 0) {
    //     console.log(req.user.nextlevel, levelCount[0].count);

    //     if (req.user.nextlevel === 2 && levelCount[0].count === 16) {
    //       req.user.rank = "SilverLife 2";
    //       req.user.earnings.cash += 30000;
    //       req.user.earnings.food += 10000;
    //       req.user.level = {
    //         position: 2,
    //         paid: true
    //       };
    //       req.user.nextlevel++;
    //       await req.user.save();
    //       const rankEarning = new _models.RankEarning({
    //         recipient: req.user.username,
    //         amount: 40000,
    //         rank: "SilverLife 2"
    //       });
    //       await rankEarning.save();
    //     }

    //     if (req.user.nextlevel === 3 && levelCount[0].count === 64) {
    //       req.user.rank = "GoldLife 1";
    //       req.user.earnings.cash += 60000;
    //       req.user.earnings.food += 12000;
    //       req.user.level = {
    //         position: 3,
    //         paid: true
    //       };
    //       req.user.nextlevel++;
    //       await req.user.save();
    //       const rankEarning = new _models.RankEarning({
    //         recipient: req.user.username,
    //         amount: 72000,
    //         rank: "GoldLife 1"
    //       });
    //       await rankEarning.save();
    //     }

    //     if (req.user.nextlevel === 4 && levelCount[0].count === 256) {
    //       req.user.rank = "GoldLife 2";
    //       req.user.earnings.cash += 120000;
    //       req.user.earnings.food += 30000;
    //       req.user.level = {
    //         position: 4,
    //         paid: true
    //       };
    //       req.user.nextlevel++;
    //       await req.user.save();
    //       const rankEarning = new _models.RankEarning({
    //         recipient: req.user.username,
    //         amount: 150000,
    //         rank: "GoldLife 2"
    //       });
    //       await rankEarning.save();
    //     }

    //     if (req.user.nextlevel === 5 && levelCount[0].count === 1024) {
    //       req.user.rank = "DiamondLife 1";
    //       req.user.earnings.cash += 250000;
    //       req.user.earnings.food += 50000;
    //       req.user.level = {
    //         position: 5,
    //         paid: true
    //       };
    //       req.user.nextlevel++;
    //       await req.user.save();
    //       const rankEarning = new _models.RankEarning({
    //         recipient: req.user.username,
    //         amount: 300000,
    //         rank: "DiamondLife 1"
    //       });
    //       await rankEarning.save();
    //     } // TODO: Monthly increment of Food Bonus

    //     if (req.user.nextlevel === 6 && levelCount[0].count === 4096) {
    //       req.user.rank = "DiamondLife 2";
    //       req.user.earnings.cash += 350000;
    //       req.user.earnings.food += 250000;
    //       req.user.level = {
    //         position: 6,
    //         paid: true
    //       };
    //       req.user.nextlevel++;
    //       await req.user.save();
    //       const rankEarning = new _models.RankEarning({
    //         recipient: req.user.username,
    //         amount: 700000,
    //         rank: "DiamondLife 2"
    //       });
    //       await rankEarning.save();
    //     } // TODO: Monthly appreciation bonus of 100000 for 5 months

    //     if (req.user.nextlevel === 7 && levelCount[0].count === 16384) {
    //       req.user.rank = "SapphireLife 1";
    //       req.user.earnings.cash += 1000000;
    //       req.user.earnings.food += 500000;
    //       req.user.level = {
    //         position: 7,
    //         paid: true
    //       };
    //       req.user.nextlevel++;
    //       await req.user.save();
    //       const rankEarning = new _models.RankEarning({
    //         recipient: req.user.username,
    //         amount: 1500000,
    //         rank: "SapphireLife 1"
    //       });
    //       await rankEarning.save();
    //     }

    //     if (req.user.nextlevel === 8 && levelCount[0].count === 65536) {
    //       req.user.rank = "SapphireLife 2";
    //       req.user.earnings.cash += 1000000;
    //       req.user.earnings.car += 4500000;
    //       req.user.level = {
    //         position: 8,
    //         paid: true
    //       };
    //       req.user.nextlevel++;
    //       await req.user.save();
    //       const rankEarning = new _models.RankEarning({
    //         recipient: req.user.username,
    //         amount: 6500000,
    //         rank: "SapphireLife 2"
    //       });
    //       await rankEarning.save();
    //     } // if (req.user.nextlevel === 9 && levelCount[0].count === 262144) {
    //     // 	req.user.rank = 'EmeraldLife'
    //     // 	req.user.earnings.suv += 15000000;
    //     // 	req.user.earnings.sholarship += 1000000;
    //     // 	req.user.level = {
    //     // 		position: 6,
    //     // 		paid: true
    //     // 	}
    //     // 	req.user.nextlevel++;
    //     // 	await req.user.save()
    //     // }
    //   }
    // }

    const deposits = await _models.Deposit.find({
      depositor: req.user.id
    }).sort({
      createdAt: -1
    });
    const withdrawals = await _models.Withdraw.find({
      withdrawer: req.user.id
    }).sort({
      createdAt: -1
    });
    const latestDeposits = deposits.slice(0, 4);
    const latestWithdrawals = withdrawals.slice(0, 4);
    const downlines = await _models.User.aggregate()
      .match({
        username: req.user.username
      })
      .graphLookup({
        from: "users",
        startWith: "$username",
        connectFromField: "username",
        connectToField: "parent",
        depthField: "depth",
        as: "descendants"
      })
      .unwind("$descendants");
    // console.log("Total downlines", downlines.length); // console.log("Downlines: ", downlines.descendants.length)

    res.render("Dashboard/", {
      depositCount: deposits.length,
      withdrawalCount: withdrawals.length,
      downlines: downlines.length,
      latestWithdrawals,
      latestDeposits
    });
  } catch (err) {
    res.send(err);
  }
}

async function deposit(req, res) {
  if (req.body.deposit) {
    try {
      req.body.deposit.depositor = req.user.id;
      const deposit = new _models.Deposit(req.body.deposit);
      const createdDeposit = await deposit.save();
      const depositAmount =
        createdDeposit.amount && Number(createdDeposit.amount) > 0
          ? Number(createdDeposit.amount)
          : 0;
      req.flash("msg", `Payment submitted successfully!`);
      res.status(201).redirect("back");
    } catch (err) {
      res.status(500).send({
        err
      });
    }
  } else {
    res.status(500).send({
      err: "Something is wrong with your input!"
    });
  }
}

async function cancelDeposit(req, res) {
  try {
    await _models.Deposit.remove({
      _id: req.params.id
    });
    res.redirect("back");
  } catch (err) {
    res.send(err);
  }
}

async function updateProfile(req, res) {
  if (req.body) {
    try {
      await _models.User.update(
        {
          _id: req.user.id
        },
        req.body.user
      );
      res.status(200).redirect("back");
    } catch (err) {
      res.status(500).send({
        err
      });
    }
  } else {
    res.status(500).send({
      err: "Something is wrong with your input!"
    });
  }
}

async function withdrawRefBonus(req, res) {
  try {
    if (!req.user.accountNumber) {
      throw 'Error: You have not submitted your Bank Details. <a class="text-info" href="/user/profile">Click here to do that</a>';
    }

    if (req.user.referralBonus === 0) {
      throw "Error: You have no Referral Bonus";
    }

    const withdraw = new _models.Withdraw({
      type: "ref",
      withdrawer: req.user.id,
      amount: req.user.referralBonus
    });
    await withdraw.save();
    await _models.User.update(
      {
        _id: req.user.id
      },
      {
        referralBonus: 0
      }
    );
    res.send("Transaction Successful");
  } catch (err) {
    res.send(err);
  }
}

async function withdrawRankEarning(req, res) {
  try {
    if (!req.user.accountNumber) {
      throw 'Error: You have not submitted your Bank Details. <a class="text-info" href="/user/profile">Click here to do that</a>';
    }

    if (
      req.user.earnings.cash === 0 &&
      req.user.earnings.food === 0 &&
      req.user.earnings.car === 0 &&
      req.user.earnings.suv === 0 &&
      req.user.earnings.scholarship === 0
    ) {
      throw "Error: You have no Rank Earnings";
    }

    const { amount } = req.body;

    if (amount === 0) {
      throw "Error: Nothing to withdraw";
    }

    const withdraw = new _models.Withdraw({
      type: req.user.rank,
      withdrawer: req.user.id,
      amount
    });
    await withdraw.save(); // Deduct earnings

    await _models.User.update(
      {
        _id: req.user.id
      },
      {
        "earnings.cash": 0,
        "earnings.food": 0,
        "earnings.car": 0,
        "earnings.suv": 0,
        "earnings.scholarship": 0
      }
    );
    res.send("Transaction Successful");
  } catch (err) {
    res.send(err);
  }
}

async function userMatrix(req, res) {
  try {
    const matrix = await _models.User.aggregate()
      .match({
        username: req.user.username
      })
      .graphLookup({
        from: "users",
        startWith: "$username",
        connectFromField: "username",
        connectToField: "parent",
        depthField: "depth",
        as: "descendants"
      })
      .unwind("$descendants")
      .replaceRoot("$descendants")
      .project({
        parent: 1,
        rank: 1,
        children: 1,
        username: 1,
        fullname: 1,
        _id: 0
      });
    const rootUserArr = await _models.User.aggregate()
      .match({
        username: req.user.username
      })
      .project({
        rank: 1,
        username: 1,
        children: 1,
        fullname: 1,
        _id: 0
      });
    const rootUser = rootUserArr[0];
    var image = "";
    if (rootUser.rank.startsWith("SilverLife"))
      image = "/images/SilverLife.png";
    else if (rootUser.rank.startsWith("GoldLife"))
      image = "/images/GoldLife.png";
    else if (rootUser.rank.startsWith("EmeraldLife"))
      image = "/images/EmeraldLife.png";
    else if (rootUser.rank.startsWith("SapphireLife"))
      image = "/images/SapphireLife.png";
    else if (rootUser.rank.startsWith("DiamondLife"))
      image = "/images/DiamondLife.png";
    else image = "/images/norank.png";
    rootUser.image = image;
    rootUser.text = {
      name: rootUser.username,
      rank: rootUser.rank,
      firstName: rootUser.fullname
        ? rootUser.fullname.substring(0, rootUser.fullname.indexOf(" "))
        : null
    };
    rootUser.collapsed = true;
    const transformedMatrix = matrix.map((user, index, arr) => {
      var newUser = user;
      newUser.text = {
        name: newUser.username,
        rank: newUser.rank,
        firstName: newUser.fullname
          ? newUser.fullname.substring(0, rootUser.fullname.indexOf(" "))
          : null
      };
      if (newUser.rank.startsWith("SilverLife"))
        image = "/images/SilverLife.png";
      else if (newUser.rank.startsWith("GoldLife"))
        image = "/images/GoldLife.png";
      else if (newUser.rank.startsWith("EmeraldLife"))
        image = "/images/EmeraldLife.png";
      else if (newUser.rank.startsWith("SapphireLife"))
        image = "/images/SapphireLife.png";
      else if (newUser.rank.startsWith("DiamondLife"))
        image = "/images/DiamondLife.png";
      else image = "/images/norank.png";
      newUser.image = image;
      return newUser;
    });
    transformedMatrix.unshift(rootUser);
    var finalMatrix = transformedMatrix.map((user, idx, arr) => {
      var finalUser = { ...user };

      if (finalUser.children.length > 0) {
        finalUser.children.forEach((child, index, childarr) => {
          arr.forEach(item => {
            if (child === item.username) {
              finalUser.children[index] = item;

              if (finalUser.children[index].rank !== "None") {
                finalUser.children[index].collapsed = true;
              }
            }
          });
        });
      }

      return finalUser;
    });
    res.send(finalMatrix);
  } catch (err) {
    console.log(err);
    res.send(err);
  }
}

function logout(req, res) {
  req.logout();
  res.redirect("/auth/login");
}
