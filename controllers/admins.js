"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.register = register;
exports.loadDashboard = loadDashboard;
exports.loadDeposits = loadDeposits;
exports.loadWithdrawals = loadWithdrawals;
exports.approveDeposit = approveDeposit;
exports.approveWithdrawal = approveWithdrawal;
exports.undoApproveDeposit = undoApproveDeposit;
exports.undoApproveWithdrawal = undoApproveWithdrawal;
exports.declineDeposit = declineDeposit;
exports.declineWithdrawal = declineWithdrawal;
exports.undoDeclineDeposit = undoDeclineDeposit;
exports.undoDeclineWithdrawal = undoDeclineWithdrawal;
exports.loadUser = loadUser;
exports.updateUser = updateUser;
exports.setUserStatus = setUserStatus;
exports.loadMembers = loadMembers;
exports.userMatrix = userMatrix;

var _models = require("../models/");

var _passport = _interopRequireDefault(require("passport"));

function _interopRequireDefault(obj) {
  return obj && obj.__esModule ? obj : { default: obj };
}

async function register(req, res) {
  if (req.body.username && req.body.password) {
    const { username, password, email, fullname, phone } = req.body;

    try {
      const admin = new _models.Admin({
        username,
        email,
        fullname,
        phone
      });
      await admin.setPassword(password);
      await admin.save();

      _passport.default.authenticate("admin")(req, res, () => {
        res.status(201).redirect("/admin/dashboard");
      });
    } catch (err) {
      res.send(err);
    }
  } else {
    res.status(500).send({
      err: "Something is wrong with your input!"
    });
  }
}

async function loadDashboard(req, res) {
  try {
    // Get total number of users
    const users = await _models.User.find();
    const totalUsers = users.length; // Get total number of withdrawals

    const withdrawals = await _models.Withdraw.find()
      .populate("withdrawer")
      .sort({
        createdAt: -1
      });
    const totalWithdrawals = withdrawals.length; // Get total number of Deposits

    const deposits = await _models.Deposit.find()
      .populate("depositor")
      .sort({
        createdAt: -1
      });
    const totalDeposits = deposits.length; // Get total number of investments

    const totalInvestments = deposits.reduce(function(acc, cur) {
      return acc + cur.amount;
    }, 0);
    const latestDeposits = deposits.slice(0, 4);
    const latestWithdrawals = withdrawals.slice(0, 4);
    res.render("Admin/", {
      totalUsers,
      totalDeposits,
      totalWithdrawals,
      totalInvestments,
      latestDeposits,
      latestWithdrawals
    });
  } catch (err) {
    res.send(err);
  }
}

async function loadDeposits(req, res) {
  try {
    const pendingDeposits = await _models.Deposit.find({
      approved: false,
      declined: false
    })
      .populate("depositor")
      .sort({
        createdAt: -1
      });
    const approvedDeposits = await _models.Deposit.find({
      approved: true,
      declined: false
    })
      .populate("depositor")
      .sort({
        createdAt: -1
      });
    const declinedDeposits = await _models.Deposit.find({
      declined: true
    })
      .populate("depositor")
      .sort({
        createdAt: -1
      });
    res.render("Admin/deposits", {
      pendingDeposits,
      approvedDeposits,
      declinedDeposits
    });
  } catch (err) {
    res.send(err);
  }
}

async function loadWithdrawals(req, res) {
  try {
    const pendingWithdrawals = await _models.Withdraw.find({
      approved: false,
      declined: false
    })
      .populate("withdrawer")
      .sort({
        createdAt: -1
      });
    const approvedWithdrawals = await _models.Withdraw.find({
      approved: true,
      declined: false
    })
      .populate("withdrawer")
      .sort({
        createdAt: -1
      });
    const declinedWithdrawals = await _models.Withdraw.find({
      declined: true
    })
      .populate("withdrawer")
      .sort({
        createdAt: -1
      });
    res.render("Admin/withdrawals", {
      pendingWithdrawals,
      approvedWithdrawals,
      declinedWithdrawals
    });
  } catch (err) {
    res.send(err);
  }
}

async function approveDeposit(req, res) {
  try {
    const deposit = await _models.Deposit.findByIdAndUpdate(req.params.id, {
      approved: true
    });
    await _models.User.update(
      {
        _id: deposit.depositor
      },
      {
        $inc: {
          depositWallet: deposit.amount
        }
      }
    );
    res.redirect("back");
  } catch (err) {
    res.send(err);
  }
}

async function approveWithdrawal(req, res) {
  try {
    await _models.Withdraw.findByIdAndUpdate(req.params.id, {
      approved: true
    });
    res.redirect("back");
  } catch (err) {
    res.send(err);
  }
}

async function undoApproveDeposit(req, res) {
  try {
    const deposit = await _models.Deposit.findByIdAndUpdate(req.params.id, {
      approved: false
    });
    await _models.User.update(
      {
        _id: deposit.depositor
      },
      {
        $inc: {
          depositWallet: -deposit.amount
        }
      }
    );
    res.redirect("back");
  } catch (err) {
    console.log(err);
    res.send(err);
  }
}

async function undoApproveWithdrawal(req, res) {
  try {
    await _models.Withdraw.findByIdAndUpdate(req.params.id, {
      approved: false
    });
    res.redirect("back");
  } catch (err) {
    res.send(err);
  }
}

async function declineDeposit(req, res) {
  try {
    const deposit = await _models.Deposit.findByIdAndUpdate(req.params.id, {
      declined: true
    });
    res.redirect("back");
  } catch (err) {
    res.send(err);
  }
}

async function declineWithdrawal(req, res) {
  try {
    const withdrawal = await _models.Withdraw.findByIdAndUpdate(req.params.id, {
      declined: true
    });

    if (withdrawal.type === "ref") {
      await _models.User.update(
        {
          _id: withdrawal.withdrawer
        },
        {
          referralBonus: withdrawal.amount
        }
      );
    } // logic for rank type

    res.redirect("back");
  } catch (err) {
    res.send(err);
  }
}

async function undoDeclineDeposit(req, res) {
  try {
    await _models.Deposit.findByIdAndUpdate(req.params.id, {
      declined: false
    });
    res.redirect("back");
  } catch (err) {
    res.send(err);
  }
}

async function undoDeclineWithdrawal(req, res) {
  try {
    const withdrawal = await _models.Withdraw.findByIdAndUpdate(req.params.id, {
      declined: false
    });

    if (withdrawal.type === "ref") {
      await _models.User.update(
        {
          _id: withdrawal.withdrawer
        },
        {
          referralBonus: 0
        }
      );
    }

    res.redirect("back");
  } catch (err) {
    res.send(err);
  }
}

async function loadUser(req, res) {
  try {
    const user = await _models.User.findOne({
      username: req.query.username
    });
    res.json(user);
  } catch (err) {
    res.send(err);
  }
}

async function updateUser(req, res) {
  if (req.body) {
    try {
      await _models.User.update(
        {
          username: req.body.username
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

async function setUserStatus(req, res) {
  try {
    if (req.body.status === "disable") {
      await _models.User.update(
        {
          username: req.body.username
        },
        {
          active: false
        }
      );
    } else {
      await _models.User.update(
        {
          username: req.body.username
        },
        {
          active: true
        }
      );
    }

    res.redirect("back");
  } catch (err) {
    res.send(err);
  }
}

async function loadMembers(req, res) {
  try {
    const users = await _models.User.find({
      rank: req.query.rank
    });
    res.json(users);
  } catch (err) {
    res.send(err);
  }
}

async function userMatrix(req, res) {
  try {
    const matrix = await _models.User.aggregate()
      .match({
        username: req.query.username
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
        _id: 0
      });
    const rootUserArr = await _models.User.aggregate()
      .match({
        username: req.query.username
      })
      .project({
        rank: 1,
        username: 1,
        children: 1,
        _id: 0
      });
    const rootUser = rootUserArr[0];
    var image = "";
    if (rootUser.rank.startsWith("SilverLife"))
      image = "/images/silverrank.png";
    else if (rootUser.rank.startsWith("GoldLife"))
      image = "/images/goldrank.png";
    else if (rootUser.rank.startsWith("EmeraldLife"))
      image = "/images/emeraldrank.png";
    else if (rootUser.rank.startsWith("SapphireLife"))
      image = "/images/sapphirerank.png";
    else if (rootUser.rank.startsWith("DiamondLife"))
      image = "/images/diamondrank.png";
    else image = "/images/norank.png";
    rootUser.image = image;
    rootUser.text = {
      name: rootUser.username,
      rank: rootUser.rank
    };
    rootUser.collapsed = true;
    const transformedMatrix = matrix.map((user, index, arr) => {
      var newUser = user;
      newUser.text = {
        name: newUser.username,
        rank: newUser.rank
      };
      if (newUser.rank.startsWith("SilverLife"))
        image = "/images/silverrank.png";
      else if (newUser.rank.startsWith("GoldLife"))
        image = "/images/goldrank.png";
      else if (newUser.rank.startsWith("EmeraldLife"))
        image = "/images/emeraldrank.png";
      else if (newUser.rank.startsWith("SapphireLife"))
        image = "/images/sapphirerank.png";
      else if (newUser.rank.startsWith("DiamondLife"))
        image = "/images/diamondrank.png";
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
    res.send(err);
  }
}
