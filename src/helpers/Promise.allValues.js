import _ from 'lodash';

Promise.allValues = async (object) => _.zipObject(_.keys(object), await Promise.all(_.values(object)));
