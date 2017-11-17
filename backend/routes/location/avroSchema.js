module.exports = {
    name: 'LocationType',
    type: 'record',
    fields: [
        {
            name: 'email',
            type: 'string'
        },
        {
            name: 'timestamp',
            type: 'double'
        },
        {
            name: 'lat',
            type: 'double'
        },
        {
            name: 'long',
            type: 'double'
        }
    ]
};