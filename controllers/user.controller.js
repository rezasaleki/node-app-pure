const users = [
    { id: 1, name: 'ali' },
    { id: 2, name: 'reza' }
];

const getUsers = async (req, res, next) => {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(users));
};

const getProfile = async (req, res, next) => {
    // do something
}

module.exports = {
    getUsers,
    getProfile
}