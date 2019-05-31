"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.register = register;
exports.loadDashboard = loadDashboard;
exports.loadDeposits = loadDeposits;
exports.loadWithdrawals = loadWithdrawals;
exports.approveDeposit = approveDeposit;
exports.batchApproveWithdrawals = batchApproveWithdrawals;
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
exports.postBlog = postBlog;
exports.getBlogs = getBlogs;
exports.getBlog = getBlog;
exports.editBlog = editBlog;
exports.updateBlog = updateBlog;
exports.deleteBlog = deleteBlog;
exports.postEvent = postEvent;
exports.getEvents = getEvents;
exports.getEvent = getEvent;
exports.editEvent = editEvent;
exports.updateEvent = updateEvent;
exports.deleteEvent = deleteEvent;

var _models = require("../models/");

var _formidable = require("formidable");

var _fs = require('fs');

var _path = require('path');

var _sanitizeHtml = require('sanitize-html');

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

    const totalInvestments = deposits.reduce(function (acc, cur) {
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

async function batchApproveWithdrawals(req, res) {
  try {
    const withdrawals = req.body.data;
    withdrawals.forEach(async withdrawal => {
      await _models.Withdraw.findByIdAndUpdate(withdrawal.value, {
        approved: true
      });
    });
    res.send("");
  } catch (err) {
    console.log(err);
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
      req.flash("msg", `Editted User ${req.body.username} successfully!`);
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
        fullname: 1,
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
    res.send(err);
  }
}

async function postBlog(req, res) {
  try {
    const blog = {};
    let newFileName;
    const form = new _formidable.IncomingForm()
    form.parse(req)
      .on('field', (name, field) => {
        if (field) {
          blog[name] = _sanitizeHtml(field, {
            allowedTags: ['h3', 'h4', 'h5', 'h6', 'blockquote', 'p', 'a', 'ul', 'ol',
              'nl', 'li', 'b', 'i', 'strong', 'em', 'strike', 'code', 'hr', 'br', 'div',
              'table', 'thead', 'caption', 'tbody', 'tr', 'th', 'td', 'pre', 'iframe', 'img', 'br', 'hr', 'audio', 'video', 'span'
            ],
            allowedAttributes: false,
            allowedIframeHostnames: ['www.youtube.com', 'player.vimeo.com']
          });
        }
      })
      .on('fileBegin', (name, file) => {
        form.on('fileBegin', (name, file) => {
          newFileName = new Date().getTime() + file.name;
          file.path = __basedir + '\\public\\uploads\\' + newFileName;
        })
      })
      .on('file', (name, file) => {
        if (file.type.startsWith('image')) {
          blog.image = '/uploads/' + newFileName;
        }
      })
      .on('end', async () => {
        var m = new Date();
        var dateString =
          m.getUTCFullYear() + "-" +
          ("0" + (m.getUTCMonth() + 1)).slice(-2) + "-" +
          ("0" + m.getUTCDate()).slice(-2) + "-" +
          ("0" + m.getUTCHours()).slice(-2) + ":" +
          ("0" + m.getUTCMinutes()).slice(-2) + ":" +
          ("0" + m.getUTCSeconds()).slice(-2);
        blog.slug = blog.title.split(" ").join("-") + dateString;
        const Blog = new _models.Blog(blog);
        await Blog.save();
        req.flash("msg", `Blog Created successfully!`);
        req.flash("msg", blog.slug);
        res.status(200).redirect("back");
      })
  } catch (err) {
    console.log(err)
    res.send(err);
  }
}

async function getBlogs(req, res) {
  try {
    const blogs = await _models.Blog.find().sort({ createdAt: -1 });
    res.render("Admin/Blogs/", { blogs })
  } catch (err) {
    console.log(err);
    res.send(err);
  }
}

async function getBlog(req, res) {
  try {
    const blog = await _models.Blog.findOne({slug: req.params.id});
    res.render("Admin/Blogs/view", { blog });
  } catch (err) {
    console.log(err);
    res.send(err);
  }
}

async function editBlog(req, res) {
  try {
    const blog = await _models.Blog.findById(req.params.id);
    res.render("Admin/Blogs/edit", { blog });
  } catch (err) {
    console.log(err)
    res.send(err);
  }
}

async function updateBlog(req, res) {
  try {
    const blog = {};
    let newFileName;
    const form = new _formidable.IncomingForm()
    form.parse(req)
      .on('field', (name, field) => {
        if (field) {
          blog[name] = _sanitizeHtml(field, {
            allowedTags: ['h3', 'h4', 'h5', 'h6', 'blockquote', 'p', 'a', 'ul', 'ol',
              'nl', 'li', 'b', 'i', 'strong', 'em', 'strike', 'code', 'hr', 'br', 'div',
              'table', 'thead', 'caption', 'tbody', 'tr', 'th', 'td', 'pre', 'iframe', 'img', 'br', 'hr', 'audio', 'video', 'span'
            ],
            allowedAttributes: false,
            allowedIframeHostnames: ['www.youtube.com', 'player.vimeo.com']
          });
        }
      })
      .on('fileBegin', (name, file) => {
        form.on('fileBegin', (name, file) => {
          if (file.name) {
            newFileName = new Date().getTime() + file.name;
            file.path = __basedir + '\\public\\uploads\\' + newFileName;
          }
        })
      })
      .on('file', (name, file) => {
        if (file.name) {
          if (file.type.startsWith('image')) {
            blog.image = '/uploads/' + newFileName;
          }
        }
      })
      .on('end', async () => {
        const updatedBlog = await _models.Blog.findByIdAndUpdate(req.params.id, blog);
        if (blog.image) {
          const filePath = _path.join(__basedir, '/public', updatedBlog.image);
            _fs.unlink(filePath, (err) => {
              if (err) throw err;
            });
        }
        res.redirect(`/admin/blogs/${updatedBlog.slug}`);
      })
  } catch (err) {
    console.log(err);
    res.send(err);
  }
}

async function deleteBlog(req, res) {
  try {
    console.log("deleting blog")
    const deletedBlog = await _models.Blog.findByIdAndRemove(req.params.id);
    if (deletedBlog.image) {
      const filePath = _path.join(__basedir, '/public', deletedBlog.image);
      _fs.unlink(filePath, (err) => {
        if(err) throw err;
      });
    }
    res.redirect("/admin/blogs");
  } catch (err) {
    console.log(err);
    res.send(err);
  }
}

async function postEvent(req, res) {
  try {
    const event = {};
    let newFileName;
    const form = new _formidable.IncomingForm()
    form.parse(req)
      .on('field', (name, field) => {
        if (field) {
          if (name === "dayFrom" || name === "dayTo") {
            event[name] = _sanitizeHtml(tConvert(field));
          } else {
            event[name] = _sanitizeHtml(field);
          }
          console.log(name, event[name]);
        }
      })
      .on('fileBegin', (name, file) => {
        newFileName = new Date().getTime() + file.name;
        file.path = __basedir + '\\public\\uploads\\events\\' + newFileName;
        console.log(_basedir);
      })
      .on('file', (name, file) => {
        if (file.type.startsWith('image')) {
          event.image = '/uploads/events/' + newFileName;
        }
      })
      .on('end', async () => {
        const Event = new _models.Event(event);
        const createdEvent = await Event.save();
        req.flash("msg", `Event Created successfully!`);
        req.flash("msg", createdEvent._id);
        res.status(200).redirect("back");
      })
  } catch (err) {
    console.log(err);
    res.send(err);
  }
}

async function getEvents(req, res) {
  try {
    const events = await _models.Event.find().sort({ createdAt: -1 });
    res.render("Admin/Events/", { events })
  } catch (err) {
    console.log(err);
    res.send(err);
  }
}

async function getEvent(req, res) {
  try {
    const event = await _models.Event.findById(req.params.id);
    res.render("Admin/Events/view", { event });
  } catch (err) {
    console.log(err);
    res.send(err);
  }
}

async function editEvent(req, res) {
  try {
    const event = await _models.Event.findById(req.params.id);
    res.render("Admin/Events/edit", { event });
  } catch (err) {
    console.log(err);
    res.send(err);
  }
}

async function updateEvent(req, res) {
  try {
    const event = {};
    let newFileName;
    const form = new _formidable.IncomingForm()
    form.parse(req)
      .on('field', (name, field) => {
        if (field) {
          event[name] = _sanitizeHtml(field);
        }
      })
      .on('fileBegin', (name, file) => {
          if (file.name) {
            newFileName = new Date().getTime() + file.name;
            file.path = __basedir + '\\public\\uploads\\events\\' + newFileName;
            console.log(_basedir);
          }
      })
      .on('file', (name, file) => {
        if (file.type.startsWith('image')) {
          event.image = '/uploads/events/' + newFileName;
        }
      })
      .on('end', async () => {
        const updatedEvent = await _models.Event.findByIdAndUpdate(req.params.id, event);
        if (event.image) {
          const filePath = _path.join(__basedir, '/public', updatedEvent.image);
          _fs.unlink(filePath, (err) => {
            if (err) throw err;
          });
        }
        res.redirect(`/admin/events/${updatedEvent._id}`);
      })
  } catch (err) {
    console.log(err);
    res.send(err);
  }
}

async function deleteEvent(req, res) {
  try {
    console.log("deleting event")
    const deletedEvent = await _models.Event.findByIdAndRemove(req.params.id);
    if (deletedEvent.image) {
      const filePath = _path.join(__basedir, '/public', deletedEvent.image);
      _fs.unlink(filePath, (err) => {
        if (err) throw err;
      });
    }
    res.redirect("/admin/events");
  } catch (err) {
    console.log(err);
    res.send(err);
  }
}

function tConvert(time) {
  // Check correct time format and split into components
  time = time.toString().match(/^([01]\d|2[0-3])(:)([0-5]\d)(:[0-5]\d)?$/) || [time];

  if (time.length > 1) { // If time format correct
    time = time.slice(1);  // Remove full string match value
    time[5] = +time[0] < 12 ? 'AM' : 'PM'; // Set AM/PM
    time[0] = +time[0] % 12 || 12; // Adjust hours
  }
  return time.join(''); // return adjusted time or original string
}