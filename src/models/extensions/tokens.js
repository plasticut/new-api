/**
 Sasha Zhuravlev 15.10.14.
 */
module.exports = {
    expired: function(){
        return this.expirationDate < new Date();
    }
};