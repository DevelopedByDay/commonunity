

const router = require('express').Router();
const { Member, Post, Comment } = require('../../models');
const withAuth = require('../../utils/auth');

router.get('/', (req, res) => {
    Member.findAll({
        attributes: { exclude: ['password'] }
    })
    .then(dbMemberData => res.json(dbMemberData))
    .catch(err => {
        console.log(err);
        res.status(500).json(err);
    });
});

router.get('/:id', (req, res) => {
    Member.findOne({
        attributes: { exclude: ['password'] },
        where: {
            id: req.params.id
        },
        include: [
            {
                model: Post,
                attributes: ['id', 'title', 'post_message', 'created_at']
            },
            {
                model: Comment,
                attributes: ['id', 'comment_text', 'created_at'],
                include: {
                    model: Post,
                    attributes: ['title']
                }
            }
        ]
    })
    .then(dbMemberData => {
        if (!dbMemberData) {
            res.status(404).json({ message: 'No member found with this id' });
            return;
        }
        res.json(dbMemberData);
    })
    .catch(err => {
        console.log(err);
        res.status(500).json(err);
    });
});

router.post('/', (req, res) => {
    Member.create({
        username: req.body.username,
        street_address: req.body.street_address,
        city: req.body.city,
        zipcode: req.body.zipcode,
        years_at_address: req.body.years_at_address,
        family_size: req.body.family_size,
        email: req.body.email,
        password: req.body.password
    })
    .then(dbMemberData => {
        req.session.save(() => {
            req.session.member_id = dbMemberData.id;
            req.session.username = dbMemberData.username;
            req.session.zipcode = dbMemberData.zipcode;
            req.session.loggedIn = true;
            res.json(dbMemberData);
        });
    })
    .catch(err => {
        console.log(err);
        res.status(500).json(err);
    });
});

router.post('/login', (req, res) => {
    Member.findOne({
        where: {
            email: req.body.email,
        }
    })
    .then(dbMemberData => {
        if (!dbMemberData) {
            res.status(400).json({ message: 'No member with that email address' });
            return;
        }
        const validPassword = dbMemberData.checkPassword(req.body.password);
        if (!validPassword) {
            res.status(400).json({ message: 'Incorrect Password' });
            return;
        }
        req.session.save(() => {
            req.session.member_id = dbMemberData.id;
            req.session.username = dbMemberData.username;
            req.session.zipcode = dbMemberData.zipcode;
            req.session.loggedIn = true;
            res.json({ member: dbMemberData, message: 'You are now logged in!' });
        });
    });
});

router.post('/logout', (req, res) => {
    if (req.session.loggedIn) {
        req.session.destroy(() => {
            res.status(204).end();
        });
    } else {
        res.status(404).end();
    }
});

router.put('/:id', withAuth, (req, res) => {
    Member.update(req.body, {
        individualHooks: true,
        where: {
            id: req.params.id
        }
    })
    .then(dbMemberData => {
        if (!dbMemberData[0]) {
            res.status(404).json({ message: 'No member found with this id' });
            return;
        }
        res.json(dbMemberData);
    })
    .catch(err => {
        console.log(err);
        res.status(500).json(err);
    });
});

router.delete('/:id', withAuth, (req, res) => {
    Member.destroy({
        where: {
            id: req.params.id
        }
    })
    .then(dbMemberData => {
        if(!dbMemberData) {
            res.status(404).json({ message: 'No member found with this id' });
            return;
        }
        res.json(dbMemberData);
    })
    .catch(err => {
        console.log(err);
        res.status(500).json(err);
    });
});

module.exports = router;