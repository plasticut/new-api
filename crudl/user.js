module.exports = {

    before: [
        'test',
        function(req, res, next) {
            console.log('before user');
            next();
        }
    ],

    create:   function(query, model, next){
        console.log('user create', arguments);

        var User = this.models.user;

        User.create([
            {
                name: "John",
                surname: "Doe",
                age: 25,
                male: true
            }
        ], function(err, res) {
            if (err) { return next(err) }
            next(err, res);
        });
    },
    delete: function(id, query, next){
        console.log('user delete', arguments);
        next();
    },
    read: function(query, next){
        console.log('user read', arguments);

        var User = this.models.user;

        User.find({}, function(err, res) {
            if (err) { return next(err) }
            next(err, res);
        });

        // next(null, [{ name: 'test' }]);
    },
    readById: function(id, query, next){
        console.log('user readById', arguments);
        next(null, { name: 'test' });
    },
    update: function(id, query, model, next){
        console.log('user update', arguments);
        next();
    }
};