const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
require('dotenv').config();
require('body-parser');
const router = express.Router();
const db = require('../config/database');

// Demo-Game route ---------------------------------------------------------------
router.get('/game', (req, res) => {
  const avatarId = '6077d9b66050745ed4e3b98e';
  db.Avatar.findById(avatarId, (err, player) => {
    if (err) {
      res.send(err);
    }
    db.Avatar.find(
      {
        $and: [
          { user: { $nin: player.user } },
          { 'stats.exp': { $gte: player.stats.exp / 3 } },
          { 'stats.exp': { $lte: player.stats.exp * 3 } },
        ],
      },
      (err, opponents) => {
        if (err) {
          res.send(err);
        }

        if (opponents.length < 1) {
          db.Avatar.find({ user: { $nin: player.user } }, (err, opponents) => {
            const pick = getRand(opponents.length - 1, 0);
            const opponent = opponents[pick];

            return res.render('game', {
              avatar: player,
              avatarId: avatarId,
              accountId: req.session.currentUser,
              opponent: opponent,
            });
          });
        } else {
          const pick = getRand(opponents.length - 1, 0);
          const opponent = opponents[pick];

          return res.render('game', {
            avatar: player,
            avatarId: avatarId,
            accountId: req.session.currentUser,
            opponent: opponent,
          });
        }
      }
    );
  });
});

// User route ---------------------------------------------------------------
// GET   --->   /index <-----  Gets -> Login form and sign-up page link
router.get('/', (req, res) => {
  res.render('index');
});
// GET  ---->  /index/new  <------------   Gets Create new user form page
router.get('/new', (req, res) => {
  res.render('new');
});
// GET  ---->  /index/logout  <------------   Ends session
router.get('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) return res.send(err);
    res.redirect('/');
  });
});

// POST ---->   /index/    <---- User Sign up and redirects to login
router.post('/', (req, res) => {
  if (!req.body.name) {
    return res.redirect('/index/new?_message="Must enter Username"');
  }
  if (!req.body.password) {
    return res.redirect('/index/new?_message="Must enter Password"');
  }
  const username = {
    name: req.body.name,
    password: req.body.password,
  };
  db.User.findOne(username, (err, foundUser) => {
    if (err) return res.send(err);

    if (!foundUser) {
      if (req.body.password === req.body.confirm) {
        bcrypt.genSalt(15, (err, salt) => {
          if (err) return res.send(err);
          bcrypt.hash(req.body.password, salt, (err, hashedObj) => {
            const newUser = {
              name: req.body.name,
              password: hashedObj,
              account: mongoose.Types.ObjectId(),
            };
            db.User.create(newUser, (err) => {
              if (err) return res.send(err);

              res.redirect('/index');
            });
          });
        });
      } else {
        res.redirect('/index/new?_message="Passwords dont match. Try again."');
      }
    } else {
      res.redirect('/index/new?_message="Username Already Taken. Try again"');
    }
  });
});

// POST ---->   /index/login  <-- redirects to  <---- User Login
router.post('/login', (req, res) => {
  const user = { name: req.body.name };
  db.User.findOne(user, (err, foundObj) => {
    if (err) {
      return res.send(err);
    }
    if (!foundObj) {
      return res.redirect('/index?_message="User info not found."');
    }

    bcrypt.compare(req.body.password, foundObj.password, (err, result) => {
      if (err) return res.send(err);

      if (result) {
        req.session.currentUser = foundObj;
        res.redirect(`/index/account`);
      } else {
        res.redirect('/index?_message="User info not found."');
      }
    });
  });
});

// GET/Show  ---->   /index/account    <---- Show User Profile
router.get('/account', (req, res) => {
  if (!req.session.currentUser) {
    return res.redirect('/index');
  }

  db.User.findById(req.session.currentUser._id)
    .populate('avatars')
    .exec((err, foundObj) => {
      if (err) return res.send(err);

      res.render('show', { user: foundObj });
    });
});

// GET ---->   /index/account/edit    <---- User Edit Form
router.get('/account/edit', (req, res) => {
  if (!req.session.currentUser) {
    return res.redirect('/index');
  }
  db.User.findById(req.session.currentUser._id, (err, foundObj) => {
    if (err) return res.send(err);

    res.render('edit', { user: foundObj });
  });
});
// POST/PUT ---->   /index/:id    <---- User Edit/Update
router.put('/account', (req, res) => {
  const dataObj = {
    newName: req.body.newName,
    currPassword: req.body.currPassword,
    newPassword: req.body.newPassword,
    confirm: req.body.confirm,
  };
  if (!req.body.newName) {
    return res.redirect('/index/account/edit?_message="Username required"');
  }

  if (dataObj.newPassword === dataObj.confirm) {
    db.User.findById(req.session.currentUser._id, (err, foundUser) => {
      if (err) return res.send(err);

      bcrypt.compare(
        dataObj.currPassword,
        foundUser.password,
        (err, result) => {
          if (result) {
            bcrypt.genSalt(15, (err, salt) => {
              if (err) return res.send(err);

              bcrypt.hash(dataObj.newPassword, salt, (err, hashedPassword) => {
                db.User.findByIdAndUpdate(
                  req.session.currentUser._id,
                  { name: dataObj.newName, password: hashedPassword },
                  { new: true },
                  (err, updatedObj) => {
                    if (err) return res.send(err);
                    res.redirect(`/index/account`);
                  }
                );
              });
            });
          } else {
            return res.redirect(
              '/index/account/edit?_message="Current password incorrect. Try again."'
            );
          }
        }
      );
    });
  } else {
    return res.redirect(
      '/index/account/edit?_message="Passwords dont match. Try again."'
    );
  }
});

router.delete('/account', (req, res) => {
  db.User.findById(req.session.currentUser._id, (err, foundObj) => {
    if (err) {
      console.log('Error:');
      console.log(err);
    }
    db.User.findByIdAndDelete(foundObj._id, (err, deletedObj) => {
      if (err) return res.send(err);
      db.Avatar.deleteMany(
        { user: req.session.currentUser._id },
        (err, deletedArr) => {
          if (err) return res.send(err);

          res.redirect('/index/logout');
        }
      );
    });
  });
});

//============================================================================================================================
// Avatar GET index ---------------------------------------------------------------
// GET   --->   /avatars index page <-----  Gets
router.get('/account/avatars', (req, res) => {
  if (!req.session.currentUser) {
    return res.redirect('/index');
  }
  return res.redirect('/index/account');
});

// Avatar GET new ---------------------------------------------------------------

router.get('/account/new', (req, res) => {
  if (!req.session.currentUser) {
    return res.redirect('/index');
  }
  return res.render('new-avatar.ejs', {
    accountId: req.session.currentUser._id,
  });
});

// Avatar POST new ---------------------------------------------------------------
// POST ---->   /avatars/    <---- POST =  new avatar and redirects to show
router.post('/account/avatars', (req, res) => {
  const rb = req.body;
  if (!rb.name) {
    return res.redirect('/index/account/new?_message="Avatar name required"');
  }

  db.User.findById(req.session.currentUser._id, (err, foundUser) => {
    if (err) return res.send(err);

    const skillpts = 50;

    const skillpost =
      +rb.health / 20 +
      +rb.mana / 20 +
      +rb.attack +
      +rb.defence +
      +rb.spclAttack +
      +rb.spclDefence;

    if (skillpost > skillpts) {
      return res.redirect('/index?_message="Cheater"');
    }

    db.Avatar.create(
      {
        name: rb.name,
        img: rb.img,
        info: rb.info,
        stats: {
          health: rb.health,
          mana: rb.mana,
          attack: rb.attack,
          defence: rb.defence,
          spclAttack: rb.spclAttack,
          spclDefence: rb.spclDefence,
        },
        user: foundUser._id,
      },
      (err, newAvatar) => {
        if (err) {
          return res.send(err);
        }
        db.User.findByIdAndUpdate(
          foundUser._id,
          { $push: { avatars: newAvatar._id } },
          { new: true },
          (err, updatedUser) => {
            res.redirect(`/index/account/`);
          }
        );
      }
    );
  });
});
// Avatar GET show ---------------------------------------------------------------

router.get('/account/avatars/:avatarId', (req, res) => {
  if (!req.session.currentUser) {
    return res.redirect('/index');
  }
  const avatarId = req.params.avatarId;
  db.Avatar.findById(avatarId, (err, foundObj) => {
    if (err) return res.send(err);
    let lvl = 1;
    if (foundObj.stats.exp >= 100) {
      lvl = Math.floor(Math.log((9 * foundObj.stats.exp) / 100) / Math.log(3));
    }

    let expRem = 3 ** (lvl - 1) * 100 - foundObj.stats.exp;
    return res.render('avatar-show', {
      avatar: foundObj,
      account: req.session.currentUser.account,
      levelInfo: { lvl: lvl, expRem: expRem },
    });
  });
});

// Avatar GET edit  ---------------------------------------------------------------

router.get('/account/avatars/:avatarId/edit', (req, res) => {
  if (!req.session.currentUser) {
    return res.redirect('/index');
  }
  const avatarId = req.params.avatarId;
  db.Avatar.findById(avatarId, (err, foundObj) => {
    if (err) {
      res.send(err);
    }
    let lvl = 1;
    if (foundObj.stats.exp >= 100) {
      lvl = Math.floor(Math.log((9 * foundObj.stats.exp) / 100) / Math.log(3));
    }
    let spent =
      foundObj.stats.health / 20 +
      foundObj.stats.mana / 20 +
      foundObj.stats.attack +
      foundObj.stats.defence +
      foundObj.stats.spclAttack +
      foundObj.stats.spclDefence;
    const skillpts = 20 * lvl + 30 - spent;

    return res.render('avatar-edit', {
      avatar: foundObj,
      avatarId: avatarId,
      accountId: req.session.currentUser.account,
      skillpts: skillpts,
      lvl: lvl,
    });
  });
});
// Avatar GET game  ---------------------------------------------------------------

router.get('/account/avatars/:avatarId/game', (req, res) => {
  if (!req.session.currentUser) {
    return res.redirect('/index');
  }
  const avatarId = req.params.avatarId;
  db.Avatar.findById(avatarId, (err, player) => {
    if (err) {
      res.send(err);
    }
    db.Avatar.find(
      {
        $and: [
          { user: { $nin: player.user } },
          { 'stats.exp': { $gte: player.stats.exp / 3 } },
          { 'stats.exp': { $lte: player.stats.exp * 3 } },
        ],
      },
      (err, opponents) => {
        if (err) {
          res.send(err);
        }

        if (opponents.length < 1) {
          db.Avatar.find({ user: { $nin: player.user } }, (err, opponents) => {
            const pick = getRand(opponents.length - 1, 0);
            const opponent = opponents[pick];

            return res.render('game', {
              avatar: player,
              avatarId: avatarId,
              accountId: req.session.currentUser,
              opponent: opponent,
            });
          });
        } else {
          const pick = getRand(opponents.length - 1, 0);
          const opponent = opponents[pick];

          return res.render('game', {
            avatar: player,
            avatarId: avatarId,
            accountId: req.session.currentUser,
            opponent: opponent,
          });
        }
      }
    );
  });
});

// Avatar POST update  ---------------------------------------------------------------
router.put('/account/avatars/:avatarId', (req, res) => {
  const avatarId = req.params.avatarId;
  const rb = req.body;
  if (!rb.name) {
    return res.redirect(
      `/index/account/avatars/${avatarId}/edit?_message="Avatar name required"`
    );
  }

  db.Avatar.findById(avatarId, (err, foundObj) => {
    if (err) {
      res.send(err);
    }
    let lvl = Math.floor(Math.log((9 * foundObj.exp) / 100) / Math.log(3));

    let spent =
      foundObj.stats.health / 20 +
      foundObj.stats.mana / 20 +
      foundObj.stats.attack +
      foundObj.stats.defence +
      foundObj.stats.spclAttack +
      foundObj.stats.spclDefence;

    const skillpts = 20 * lvl + 30 - spent;

    const skillpost =
      rb.health / 20 +
      rb.mana / 20 +
      rb.attack +
      rb.defence +
      rb.spclAttack +
      rb.spclDefence;

    if (skillpost > skillpts) {
      return res.redirect('/index?_message="Cheater"');
    }
  });

  // Avatar GET game  ---------------------------------------------------------------

  db.Avatar.findById(avatarId, (err, foundAvatar) => {
    if (err) {
      res.send(err);
    }
    let lvl = Math.floor(
      Math.log((9 * foundAvatar.stats.exp) / 100) / Math.log(3)
    );

    const skillpts = 20 * lvl + 30;

    const skillpost =
      +rb.health / 20 +
      +rb.mana / 20 +
      +rb.attack +
      +rb.defence +
      +rb.spclAttack +
      +rb.spclDefence;

    if (skillpost > skillpts) {
      return res.redirect('/index?_message="Cheater"');
    }

    db.User.findById(req.session.currentUser._id, (err, foundUser) => {
      if (err) {
        res.send(err);
      }

      const updateObj = {
        name: rb.name,
        info: rb.info,
        stats: {
          health: rb.health,
          mana: rb.mana,
          attack: rb.attack,
          defence: rb.defence,
          spclAttack: rb.spclAttack,
          spclDefence: rb.spclDefence,
          exp: foundAvatar.stats.exp,
        },
        user: foundAvatar.user,
        img: rb.img,
      };

      db.Avatar.findByIdAndUpdate(
        avatarId,
        updateObj,
        { new: true },
        (err, updatedAvatar) => {
          if (err) {
            res.send(err);
          }
          return res.redirect(`/index/account/avatars/${avatarId}`);
        }
      );
    });
  });
});

router.delete('/account/avatars/:avatarId', (req, res) => {
  const avatarId = req.params.avatarId;
  db.User.findById(req.session.currentUser._id, (err, foundUser) => {
    if (err) return res.send(err);

    db.Avatar.findByIdAndDelete(avatarId, (err, deletedAvatar) => {
      if (err) return res.send(err);

      db.User.findByIdAndUpdate(
        req.session.currentUser._id,
        { $pull: { avatars: deletedAvatar._id } },
        { new: true },
        (err, updatedUser) => {
          res.redirect(`/index/account`);
        }
      );
    });
  });
});

router.put('/:account/avatars/:avatarId/level', (req, res) => {
  const avatarId = req.params.avatarId;
  const rb = req.body;
  const personalityMatrix = req.body.personality;

  db.Avatar.findById(avatarId, (err, foundObj) => {
    const obj = {
      name: foundObj.name,
      info: foundObj.info,
      stats: {
        health: foundObj.stats.health,
        mana: foundObj.stats.mana,
        attack: foundObj.stats.attack,
        defence: foundObj.stats.defence,
        spclAttack: foundObj.stats.spclAttack,
        spclDefence: foundObj.stats.spclDefence,
        exp: +req.body.exp,
      },
      personality: personalityMatrix,
      img: foundObj.img,
      user: foundObj.user,
    };

    db.Avatar.findByIdAndUpdate(
      avatarId,
      obj,
      { new: true },
      (err, updatedAvatar) => {
        if (err) {
          console.log('Error:');
          console.log(err);
          res.send(err);
        }
        return res.redirect(`/index/account/avatars/${avatarId}/game`);
      }
    );
  });
});

function getRand(max, min) {
  let num = Math.random() * (max + 1 - min) + min - 1;
  num = Math.ceil(num);
  return num;
}

//============================================================================================================================

module.exports = router;
