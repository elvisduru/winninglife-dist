// const fs = require("fs");

// fs.readFile("./referral.json", (err, data) => {
//   if (err) throw err;
//   let referralBonuses = JSON.parse(data);
//   referralBonuses.forEach(referralBonus => {
//     _models.User.find(
//       { username: referralBonus.username },
//       (err, foundUser) => {
//         _models.User.find;
//       }
//     );
//   });
// });

// const readFile = (path, opts = "utf8") => {
//   return new Promise((resolve, reject) => {
//     fs.readFile(path, opts, (err, data) => {
//       if (err) reject(err);
//       else resolve(data);
//     });
//   });
// };

// (async function() {
//   let count = 0;
//   const referralJSON = await readFile("./referral.json");
//   let referralBonuses = JSON.parse(referralJSON);
//   referralBonuses.forEach(async referralBonus => {
//     try {
//       const user = await _models.User.findOne({
//         username: referralBonus.username
//       });
//       console.log(`Started with ${referralBonus.username}`);
//       const referrals = await _models.User.find({
//         referrer: referralBonus.username
//       });
//       const userReferralBonus =
//         referrals.length * 1000 - referralBonus.referralBonus;

//       user.referralBonus = userReferralBonus;
//       console.log(`UserID: ${referralBonus.username}, No of Refs: ${
//         referrals.length
//       }, TotalRefAmt: ${referrals.length *
//         1000}, CurrentRefAmt: ${userReferralBonus}, TotalPaidAmt: ${
//         referralBonus.referralBonus
//       },
//         ${count++}`);
//       await user.save();
//     } catch (err) {
//       console.log(err);
//     }
//   });
// })();

// let usersProcessed = 0;

// Recreate and Hash User Password
// _models.User.find({})
//   .then(function(users) {
//     console.log("Started password update task");
//     users.forEach(user => {
//       if (user.password) {
//         user.setPassword(user.password, function() {
//           console.log(`Started with ${user.username}`);
//           user.changePassword(user.password, user.password, function() {
//             console.log(`Changed ${user.username} password`);
//             user.update({ $unset: { password: 1 } }, function() {
//               user.save(function() {
//                 usersProcessed++;
//                 console.log(usersProcessed);
//               });
//             });
//           });
//         });
//       }
//     });
//   })
//   .catch(err => console.log(err));

// Update Children Field for each user
// _models.User.find({})
//   .then(users => {
//     console.log("Started Children update task");
//     users.forEach((user, index, arr) => {
//       if (user.username) {
//         console.log(`Creating child array for ${user.username}`);
//         user.children = [];
//         arr.forEach(arrUser => {
//           if (arrUser.parent) {
//             if (arrUser.parent === user.username) {
//               user.children.push(arrUser.username);
//             }
//           }
//         });
//         user.save((err, savedUser) => {
//           if (err) console.log(err);
//           console.log(`added users to child array for ${savedUser.username}`);
//           usersProcessed++;
//           console.log(usersProcessed);
//         });
//       }
//     });
//   })
//   .catch(err => console.log(err));

// update all users parents to capital
// (async function capitalizeParent() {
//   const users = await _models.User.find({});

//   users.forEach(async user => {
//     if (user.parent) {
//       user.parent = user.parent.toUpperCase();
//       await user.save(
//         await function() {
//           console.log("parent updated");
//         }
//       );
//     }
//   });
// })();

// Rank Update Task
// async function fetchLevel(num, username) {
//   let levelSum = await _models.User.aggregate()
//     .match({
//       username: username
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
//       "descendants.depth": num
//     })
//     .group({
//       _id: null,
//       count: {
//         $sum: 1
//       }
//     });

//   return levelSum[0];
// }

// // // // Rank Update Task
// (async function() {
//   console.log("Started Rank Level Update Task");
//   const users = await _models.User.find({});

//   users.forEach(async user => {
//     let emptyLevel = false;
//     let levels = [];
//     let levelsProcessed = 0;
//     let lastCompleteLevel;

//     while (!emptyLevel) {
//       const level = await fetchLevel(levelsProcessed, user.username);
//       if (level === undefined) {
//         levelsProcessed = 0;
//         emptyLevel = true;
//       } else {
//         levels.push(level.count);
//         levelsProcessed++;
//       }
//     }

//     if (user.children.length < 4) {
//       user.nextlevel = 1;
//       user.rank = "None";
//     }

//     if (user.children.length === 4) {
//       lastCompleteLevel = levels[0];
//       for (let i = 1; i < levels.length; i++) {
//         if (levels[i] > lastCompleteLevel) {
//           lastCompleteLevel = levels[i];
//         }
//       }

//       // if (lastCompleteLevel === 4) {
//       //   user.nextlevel = 2;
//       //   user.rank = "SilverLife";
//       // }

//       // if (lastCompleteLevel === 16) {
//       //   user.nextlevel = 3;
//       //   user.rank = "GoldLife 1";
//       // }

//       // if (lastCompleteLevel === 64) {
//       //   user.nextlevel = 4;
//       //   user.rank = "GoldLife 2";
//       // }

//       // if (lastCompleteLevel === 256) {
//       //   user.nextlevel = 5;
//       //   user.rank = "DiamondLife 1";
//       // }

//       // if (lastCompleteLevel === 1024) {
//       //   user.nextlevel = 6;
//       //   user.rank = "DiamondLife 2";
//       // }

//       // if (lastCompleteLevel === 4096) {
//       //   user.nextlevel = 7;
//       //   user.rank = "SapphireLife 1";
//       // }

//       // if (!lastCompleteLevel && user.children.length === 4) {
//       //   user.nextlevel = 2;
//       //   user.rank = "SilverLife";
//       // }

//       if (
//         (levels[0] === 4 && levels[1] < 16) ||
//         (levels[0] === 4 && levels.length === 1)
//       ) {
//         user.nextlevel = 2;
//         user.rank = "SilverLife";
//       }

//       if ((levels[1] === 16 && levels[2] < 64) || lastCompleteLevel === 16) {
//         user.nextlevel = 3;
//         user.rank = "GoldLife 1";
//       }

//       if ((levels[2] === 64 && levels[3] < 256) || lastCompleteLevel === 64) {
//         user.nextlevel = 4;
//         user.rank = "GoldLife 2";
//       }

//       if (
//         (levels[3] === 256 && levels[4] < 1024) ||
//         lastCompleteLevel === 256
//       ) {
//         user.nextlevel = 5;
//         user.rank = "DiamondLife 1";
//       }

//       if (
//         (levels[4] === 1024 && levels[5] < 4096) ||
//         lastCompleteLevel === 1024
//       ) {
//         user.nextlevel = 6;
//         user.rank = "DiamondLife 2";
//       }

//       if (
//         (levels[5] === 4096 && levels[6] < 16384) ||
//         lastCompleteLevel === 4096
//       ) {
//         user.nextlevel = 7;
//         user.rank = "SapphireLife 1";
//       }
//       console.log(
//         `Processed user: ${user.username}, max: ${lastCompleteLevel}`
//       );
//     } else {
//       console.log(`Processed user: ${user.username}, None`);
//     }

//     await user.save();
//   });
//   console.log("Rank Level Update Task Completed");
// })();


// Change User Password Feature
// const users = ["A01E9B", "91E213", "65B5D8", "B69CD3"];
// users.forEach(async user => {
//   const foundUser = await _models.User.findOne({ username: user });
//   console.log(`Setting password for ${foundUser.username}`);
//   await foundUser.setPassword("raheem");
//   console.log(`Saving ${foundUser.username}`);
//   await foundUser.save();
// });


// Users Bulk Delete and Update Task

// (async function () {
//   let userArr = await _models.User.aggregate()
//     .match({
//       username: '4C8941'
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
//     .replaceRoot("$descendants")
//     .match({ depth: 2 })

  // loop and remove documents
  // userArr.forEach(async doc => {
  //   await _models.User.findByIdAndDelete(doc._id)
  // })

  // Reset Data for Last Tree
  // userArr.forEach(async doc => {
  //   await _models.User.findByIdAndUpdate(doc._id, {
  //     rank: "None",
  //     nextlevel: 1,
  //     children: [],
  //     downlines: 0,
  //     level: {
  //       position: 0,
  //       paid: false
  //     }
  //   })
  // })

//   await console.log(userArr.length)
// })()