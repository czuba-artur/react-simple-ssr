import * as fs from 'fs';

import Helmet, { HelmetData } from "react-helmet";
import { Store } from 'redux';

export interface ISSRRenderer {
    render(): Promise<string>;
}

export abstract class SSRRenderer implements ISSRRenderer {
    protected body: string;
    protected store?: Store<any>;

    protected onRender: Promise<any> | undefined;

    constructor() {
        this.body = ``;
    }

    public render(): Promise<string> {
        this.updateBody();
        return this.prepareHTML();
    }

    protected updateBody() {}

    private prepareHTML(): Promise<string> {
        return new Promise((resolve, reject) => {
            fs.readFile('./build/index.html', 'utf-8', (err: Error, data: string) => {
                if (err) {
                    reject(err);
                }
                const attributes: HelmetData = Helmet.renderStatic();

                const initialDataString: string = this.store ? `
                    <script>
                        window.__initialData__ = ${JSON.stringify(this.store.getState())};
                    </script>
                `: '{}';

                if (attributes) {
                    data = data.replace('<html lang="en">', `<html ${attributes.htmlAttributes ? attributes.htmlAttributes.toString() : null}>`);
                    data = data.replace('</head>', `
                        ${attributes.title ? attributes.title.toString() : null} 
                        ${attributes.meta ? attributes.meta.toString() : null} 
                        ${attributes.link ? attributes.link.toString(): null} 
                        ${initialDataString}
                    </head>`);
                }
                
                data = data.replace('<div id="root"></div>', `<div id="root">${this.body}</div>`);
    
                resolve(data);
            });
        });
    }
}