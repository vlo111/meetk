import React from 'react';
import AddNodeModal from '../../components/chart/AddNodeModal';
import renderWithRedux from '../render-redux';

/**
 * Render add node modal component
 * Node data with validation
 */
describe('add/update node modal', () => {
  let wrapper;

  const Selector = Object.freeze({
    nodeStatus: '.nodeStatus',
    nodeTypes: '.nodeTypes',
    colorPicker: '.colorPicker',
    fileUpload: '.fileUpload',
    keywords: '.keywords',
    nodeName: '.nodeName',
    nodeLink: '.nodeLink',
    nodeSize: '.manualSize',
  });

  beforeEach(() => {
    (wrapper = renderWithRedux(<AddNodeModal />));
  });

  const form = (id, selector) => wrapper.find(`#${id}`).find(`${selector}`);

  const field = (selector) => form('createNode', selector);

  const expectToBeInputFieldOfTypeText = (formElement, type) => {
    expect(formElement).not.toBeNull();
    expect(formElement.type()).toEqual('input');
    if (type) expect(formElement.type).toEqual(type);
  };

  const expectToBeFieldsInDom = (...args) => {
    args.forEach((selector) => {
      expect(field(selector)).toHaveLength(1);
    });
  };

  const expectShowMoreField = () => {
    const inAdvance = field('.show-more');

    expect(inAdvance.text()).toEqual('Show More');

    inAdvance.simulate('click');

    expect(inAdvance.text()).toEqual('Show Less');
  };

  const itRendersAsATextBox = (selector, type) => {
    it('renders as a text box', () => {
      expectToBeInputFieldOfTypeText(field(selector), type);
    });
  };

  itRendersAsATextBox(`${Selector.nodeName} > input`);

  it('required fields should be in the modal', () => {
    expectShowMoreField();

    expectToBeInputFieldOfTypeText(field(`${Selector.nodeLink} > input`));

    expectToBeFieldsInDom(Selector.nodeStatus,
      Selector.nodeStatus, Selector.nodeTypes,
      Selector.fileUpload, Selector.keywords,
      Selector.nodeSize);
  });

  it('fill in the fields to save', () => {
    expectShowMoreField();

    const event = { target: { value: Selector.nodeName } };

    const nameInput = () => field(`${Selector.nodeName} > input`);

    expect(nameInput().instance().value).toEqual('');

    nameInput().simulate('change', event);

    expect(nameInput().instance().value).toMatch(Selector.nodeName);
  });
});
