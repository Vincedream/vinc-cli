#!/usr/bin/env node
const fs = require('fs');
const program = require('commander');
const download = require('download-git-repo');
const axios = require('axios');
const inquirer = require('inquirer');
const ora = require('ora');
const chalk = require('chalk');
const symbols = require('log-symbols');

program.version('1.0.0', '-v, --version')
    .command('init <name>')
    .action((name) => {
        console.log('正在获取模版列表...')
        axios.get('https://api.github.com/repos/vincedream/vinc-templates/branches').then(res => {
            const list = [];
            res.data.forEach(res=>{
                const name = res.name;
                if(name !== 'master') {
                    list.push(name)
                }
            })
            if(!fs.existsSync(name)){
                inquirer.prompt([
                    {
                        name: 'description',
                        message: '请输入项目描述'
                    },
                    {
                        name: 'author',
                        message: '请输入作者名称'
                    },
                    {
                        type:'list',
                        message:'请选择模版：',
                        name:'type',
                        choices:list
                    }
                ]).then((answers) => {
                    const spinner = ora('正在下载模板...');
                    spinner.start();
                    download(`Vincedream/vinc-templates#${answers.type}`, name, (err) => {
                        if(err){
                            spinner.fail();
                            console.log(symbols.error, chalk.red(err));
                        }else{
                            spinner.succeed();
                            const fileName = `${name}/package.json`;
                            const meta = {
                                name,
                                description: answers.description,
                                author: answers.author
                            }
                            if(fs.existsSync(fileName)){
                                const content = JSON.parse(fs.readFileSync(fileName).toString());
                                const result = {...content, ...meta}
                                fs.writeFileSync(fileName, JSON.stringify(result, null, 4));
                            }
                            console.log(symbols.success, chalk.green('项目初始化完成'));
                        }
                    })
                }).catch(err=>{
                    console.log('初始化失败:',err)
                })
            }else{
                // 错误提示项目已存在，避免覆盖原有项目
                console.log(symbols.error, chalk.red('项目已存在'));
            }
        }).catch(err=>{
            console.log('获取模版列表失败:',err)
        })
    })
program.parse(process.argv);