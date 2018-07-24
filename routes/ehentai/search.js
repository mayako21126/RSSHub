const axios = require('../../utils/axios');
const cheerio = require('cheerio');
const find = require('cheerio-eq');
const config = require('../../config');

module.exports = async (ctx) => {
    const search = ctx.params.search;
    const page = 0;
    const url = `https://e-hentai.org/?page=${page}&f_doujinshi=0&f_manga=0&f_artistcg=0&f_gamecg=0&f_western=1&f_non-h=0&f_imageset=0&f_cosplay=0&f_asianporn=0&f_misc=0&f_search=${search}&f_apply=Apply+Filter`;
    const res = await axios({
        method: 'get',
        url: url,
        headers: {
            'User-Agent': config.ua,
        },
    });
    // console.log(res);
    const data = res.data;
    const $ = cheerio.load(data);
    // console.log($('.itg'));
    $('.itg tr:not([class])').remove();
    const tr = $('.itg tr');
    const items = [];
    tr.each(function(i, item) {
        items.push({
            title: `${$(item)
                .find('.itd .it5')
                .text()}`,
            description: `上传者：${$(item)
                .find('.itu')
                .text()}<img referrerpolicy="no-referrer" src="${$(item)
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
    ctx.state.data = {
        title: `e绅士上关于${search}的结果`,
        link: url,
        description: `${search}`,
        item: items,
    };
};
