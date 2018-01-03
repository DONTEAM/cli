const debug = require('debug')('codefresh:cli:create:context');
const Command = require('../../Command');
const CFError = require('cf-errors');
const _ = require('lodash');
const DEFAULTS = require('../../defaults');
const { workflow , pipeline } = require('../../../../logic').api;
const { specifyOutputForSingle, specifyOutputForArray } = require('../../helpers/get');
const getRoot = require('../root/get.cmd');

const command = new Command({
    command: 'workflows [id]',
    description: 'Get workflows',
    builder: (yargs) => {
        return yargs
            .positional('id', {
                describe: 'workflow id',
            })
            .option('limit', {
                describe: 'Limit amount of returned results',
                default: DEFAULTS.GET_LIMIT_RESULTS,
            })
            .option('page', {
                describe: 'Paginated page',
                default: DEFAULTS.GET_PAGINATED_PAGE,
            })
            .option('status', {
                describe: 'Filter results by statuses',
                type: Array,
                choices: ['error', 'running', 'success', 'terminated'],
            })
            .option('trigger', {
                describe: 'Filter results by triggers',
                type: Array,
                choices: ['build', 'launch'],
            })
            .option('pipeline-id', {
                describe: 'Filter results by pipeline id',
                type: Array,
                default: [],
            })
            .option('pipeline-name', {
                describe: 'Filter results by pipeline name',
                type: Array,
                default: [],
            });

    },
    handler: async (argv) => {
        const workflowId = argv.id;
        const limit = argv.limit;
        const page = argv.page;
        const status = argv.status;
        const trigger = argv.trigger;
        const pipelineNames = !_.isArray(argv['pipeline-name']) ? [(argv['pipeline-name'])] : argv['pipeline-name'];
        const pipelineIds = !_.isArray(argv['pipeline-id']) ? [(argv['pipeline-id'])] : argv['pipeline-id'];

        let workflows;
        // TODO:need to decide for one way for error handeling
        if (workflowId) {
            workflows = await workflow.getWorkflowById(workflowId);
            specifyOutputForSingle(argv.output, workflows);
        } else {
            if (_.isEmpty(pipelineIds) && !_.isEmpty(pipelineNames)) {
                const pipelines = await pipeline.getAll();
                _.forEach(pipelineNames, (pipelineName) => {
                    const matchPipelines = _.find(pipelines, pipeline => pipeline.info.name.toString() === pipelineName);
                    if (_.isArray(matchPipelines)) {
                        _.forEach(matchPipelines, (currPipeline) => {
                            pipelineIds.push(currPipeline.info.id);
                        });
                    } else {
                        pipelineIds.push(matchPipelines.info.id);
                    }
                });
            }
            workflows = await workflow.getWorkflows({
                limit,
                page,
                status,
                trigger,
                pipelineIds,
            });
            specifyOutputForArray(argv.output, workflows);
        }
    },
});
getRoot.subCommand(command);


module.exports = command;