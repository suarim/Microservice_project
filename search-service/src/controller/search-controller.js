const logger = require('../utils/logger');
const Search = require('../models/Search');

const SearchPostController = async (req, res) => {
    logger.info('Search Post Controller');
    try {
        const { query } = req.query;
        console.log(`this is query ${query}`);
        const results = await Search.find(
            { $text: { $search: query } },
            { score: { $meta: 'textScore' } }
        )
        .sort({ score: { $meta: 'textScore' } })
        .limit(10);

        res.status(200).json({
            status: 'success',
            data: { results }
        });
    } catch (err) {
        logger.error('Error in Search Post Controller:', err);
        res.status(500).json({
            status: 'error',
            message: 'Internal Server Error'
        });
    }
};

module.exports = {SearchPostController};
