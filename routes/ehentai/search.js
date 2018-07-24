const axios = require('../../utils/axios');
const cheerio = require('cheerio');
const config = require('../../config');

module.exports = async (ctx) => {
    const search = ctx.params.search;
    const doujinshi = ctx.query.doujinshi || 0;
    const manga = ctx.query.manga || 0;
    const artistcg = ctx.query.artistcg || 0;
    const gamecg = ctx.query.gamecg || 0;
    const western = ctx.query.western || 0;
    const nonh = ctx.query.nonH || 0;
    const imageset = ctx.query.imageset || 0;
    const cosplay = ctx.query.cosplay || 0;
    const asianporn = ctx.query.asianporn || 0;
    const misc = ctx.query.misc || 0;
    const page = ctx.query.page || 0;
    let items = [];
    let url = '';
    for (let i = 0; i <= page; i++) {
        url = `https://e-hentai.org/?page=${i}&f_doujinshi=${doujinshi}&f_manga=${manga}&f_artistcg=${artistcg}&f_gamecg=${gamecg}&f_western=${western}&f_non-h=${nonh}&f_imageset=${imageset}&f_cosplay=${cosplay}&f_asianporn=${asianporn}&f_misc=${misc}&f_search=${search}&f_apply=Apply+Filter`;
        const cache = await ctx.cache.get(url);
        if (!cache) {
            const res = await axios({
                method: 'get',
                url: url,
                headers: {
                    'User-Agent': config.ua,
                },
            });
            // console.log('请求了');
            // console.log(res);
            const data = res.data;
            const $ = cheerio.load(data);
            const tmp = [];
            $('.itg tr:not([class])').remove();
            const tr = $('.itg tr');
            tr.each(function (i, item) {
                tmp.push({
                    title: `${$(item)
                        .find('.itd .it5')
                        .text()}`,
                    description: `上传者：${$(item)
                        .find('.itu')
                        .text()}<img src="${$(item)
                            .find('.itdc img')
                            .attr('src')}">`,
                    pubDate: new Date(
                        $(item)
                            .find('.itd')
                            .eq(0)
                            .text()
                    ).toUTCString(),
                    link: $(item)
                        .find('.itd .it5 a')
                        .attr('href'),
                    guid: $(item)
                        .find('.itd .it5 a')
                        .attr('href'),
                });
            });
            items = items.concat(tmp);
            ctx.cache.set(url, tmp, 1 * 10 * 60);
        } else {
            items = items.concat(JSON.parse(cache));
        }
    }
    ctx.state.data = {
        title: `e绅士上关于${search}的结果`,
        link: url,
        description: `${search}`,
        item: items
    };
};
