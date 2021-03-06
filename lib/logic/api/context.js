const _ = require('lodash');
const CFError = require('cf-errors'); // eslint-disable-line
const { sendHttpRequest } = require('./helper');
const Context = require('../entities/Context');

const _extractFieldsForContextEntity = context => ({
    apiVersion: context.apiVersion,
    kind: context.kind,
    metadata: context.metadata,
    owner: context.owner,
    type: context.spec.type,
    spec: context.spec,
});


const createContext = async (data) => {
    const options = {
        url: '/api/contexts/',
        method: 'POST',
        body: data,
    };

    return sendHttpRequest(options);
};

const replaceByName = async (name, data) => {
    const body = data;

    const options = {
        url: `/api/contexts/${name}`,
        method: 'PUT',
        body,
    };

    return sendHttpRequest(options);
};

const applyByName = async (name, data) => {
    const body = data;

    const options = {
        url: `/api/contexts/${name}`,
        method: 'PATCH',
        body,
    };

    return sendHttpRequest(options);
};

const getContextByName = async (name, owner) => {
    const options = {
        url: `/api/contexts/${name}`,
        method: 'GET',
        qs: { owner },
    };

    const context = await sendHttpRequest(options);
    const data = _extractFieldsForContextEntity(context);
    return new Context(data);
};

const getContexts = async (info) => {
    const userOptions = {
        url: '/api/contexts',
        method: 'GET',
        qs: _.pick(info, 'owner', 'type'),
    };

    const result = await sendHttpRequest(userOptions);
    const contexts = [];
    let data = {};
    _.forEach(result, (context) => {
        data = _extractFieldsForContextEntity(context);
        contexts.push(new Context(data));
    });

    return contexts;
};

const deleteContextByName = async (name, owner) => {
    const options = {
        url: `/api/contexts/${name}`,
        method: 'DELETE',
        body: { owner },
    };

    return sendHttpRequest(options);
};

module.exports = {
    createContext,
    getContextByName,
    getContexts,
    deleteContextByName,
    replaceByName,
    applyByName,
};
