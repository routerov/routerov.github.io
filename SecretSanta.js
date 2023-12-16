var SecretSanta = function () {

    this.names = [];

    this.enforced = Object.create( null );
    this.blacklists = Object.create( null );
};


SecretSanta.prototype.add = function ( name ) {

    if ( this.names.indexOf( name ) !== -1 )
        throw new Error( 'Cannot redefine ' + name );

    this.names.push( name );

    var subapi = { };

    subapi.enforce = function ( other ) {

        this.enforced[ name ] = other;

        return subapi;

    }.bind( this );

    subapi.blacklist = function ( other ) {

        if ( ! Object.prototype.hasOwnProperty.call( this.blacklists, name ) )
            this.blacklists[ name ] = [];

        if ( this.blacklists[ name ].indexOf( other ) === -1 )
            this.blacklists[ name ].push( other );

        return subapi;

    }.bind( this );

    return subapi;

};

SecretSanta.prototype.generate = function () {

    var pairings = Object.create( null );
    var candidatePairings = Object.create( null );

    this.names.forEach( function ( name ) {

        if ( Object.prototype.hasOwnProperty.call( this.enforced, name ) ) {

            var enforced = this.enforced[ name ];

            if ( this.names.indexOf( enforced ) === -1 )
                throw new Error( name + ' is paired with ' + enforced + ', which hasn\'t been declared as a possible pairing' );

            Object.keys( pairings ).forEach( function ( name ) {

                if ( pairings[ name ] === enforced ) {
                    throw new Error( 'Per your rules, multiple persons are paired with ' + enforced );
                }

            } );

            candidatePairings[ name ] = [ this.enforced[ name ] ];

        } else {

            var candidates = _.difference( this.names, [ name ] );

            if ( Object.prototype.hasOwnProperty.call( this.blacklists, name ) )
                candidates = _.difference( candidates, this.blacklists[ name ] );

            candidatePairings[ name ] = candidates;

        }

    }, this );

    var findNextGifter = function () {

        var names = Object.keys( candidatePairings );

        var minCandidateCount = _.min( names.map( function ( name ) { return candidatePairings[ name ].length; } ) );
        var potentialGifters = names.filter( function ( name ) { return candidatePairings[ name ].length === minCandidateCount; } );

        return _.sample( potentialGifters );

    };

    while ( Object.keys( candidatePairings ).length > 0 ) {

        var name = findNextGifter();

        if ( candidatePairings[ name ].length === 0 )
        throw new Error('Il n\'a pas été possible de trouver un partenaire pour ' + name + ' ! Réessayez, si ça ne fonctionne toujours pas, essayez d\'enlever des exclusions. Désolé !');

        var pairing = _.sample( candidatePairings[ name ] );
        delete candidatePairings[ name ];

        Object.keys( candidatePairings ).forEach( function ( name ) {
            candidatePairings[ name ] = _.without( candidatePairings[ name ], pairing );
        } );

        pairings[ name ] = pairing;

    }

    return pairings;

};
