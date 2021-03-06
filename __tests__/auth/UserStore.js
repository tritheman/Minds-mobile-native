import {toJS} from 'mobx';
import { whenWithTimeout } from 'mobx-utils';
import channelService from '../../src/channel/ChannelService';
import UserStore from '../../src/auth/UserStore';
import meFactory from '../../__mocks__/fake/auth/MeFactory';
import UserModel from '../../src/channel/UserModel';


jest.mock('../../src/channel/ChannelService');
jest.mock('../../src/channel/UserModel');

// mock the static create method
UserModel.create = jest.fn();

let store;

describe('user store', () => {
  beforeEach(() => {
    channelService.load.mockClear();
    UserModel.create.mockClear();
    store = new UserStore();
  });

  it('should call channel service load and update me', async (done) => {

    expect.assertions(4);
    // fake api response
    const apiResponseFake = {channel: meFactory(1)};

    // mock methods called
    channelService.load.mockResolvedValue(apiResponseFake);
    UserModel.create.mockReturnValue(apiResponseFake.channel);

    // me observable should be updated with the api returned data
    whenWithTimeout(
      () => store.me.guid == 1,
      () => expect(toJS(store.me)).toEqual(apiResponseFake.channel),
      200,
      () => done.fail("store didn't set me observable")
    );

    try {
      // me must be empty before call load
      expect(store.me.guid).toEqual(undefined);

      const res = await store.load();

      // call api post one time
      expect(channelService.load).toBeCalledWith('me');
      expect(UserModel.create).toBeCalled();

      done();
    } catch (e) {
      done.fail(e);
    }
  });

  it('should create a new model on setUser', async (done) => {

    expect.assertions(3);

    // fake user
    const fakeUser = meFactory(1);

    // mock methods called
    UserModel.create.mockReturnValue(fakeUser);

    // me observable should be updated with the new user
    whenWithTimeout(
      () => store.me.guid == 1,
      () => expect(toJS(store.me)).toEqual(fakeUser),
      200,
      () => done.fail("store didn't set me observable")
    );

    try {
      // me must be empty before call load
      expect(store.me.guid).toEqual(undefined);

      const res = store.setUser(fakeUser);

      expect(UserModel.create).toBeCalled();

      done();
    } catch (e) {
      done.fail(e);
    }
  });

  it('should set rewards on the observable', async (done) => {

    expect.assertions(1);

    // fake user
    const fakeUser = meFactory(1);

    // mock methods called
    UserModel.create.mockReturnValue(fakeUser);

    // me observable should be updated with the new user
    whenWithTimeout(
      () => store.me.rewards == false,
      () => expect(store.me.rewards).toEqual(false),
      200,
      () => done.fail("store didn't set me observable")
    );

    try {
      // set the user
      store.setUser(fakeUser);
      // change reward
      store.setRewards(false);
      done();
    } catch (e) {
      done.fail(e);
    }
  });

  it('should set wallet on the observable', async (done) => {

    // fake user
    const fakeUser = meFactory(1);

    // mock methods called
    UserModel.create.mockReturnValue(fakeUser);

    // me observable should be updated with the new user
    whenWithTimeout(
      () => store.me.eth_wallet == '0xFFFFFFFF',
      () => done(),
      200,
      () => done.fail("store didn't set me observable")
    );

    try {
      // set the user
      store.setUser(fakeUser);
      // change wallet
      store.setWallet('0xFFFFFFFF');
    } catch (e) {
      done.fail(e);
    }
  });

  it('should clear the user', async (done) => {

    expect.assertions(1);

    // fake user
    const fakeUser = meFactory(1);

    // mock methods called
    UserModel.create.mockReturnValue(fakeUser);

    try {
      // set the user
      store.setUser(fakeUser);

      // me observable should be updated with the new user
      whenWithTimeout(
        () => Object.keys(store.me).length === 0,
        () => expect(store.me).toEqual({}),
        200,
        () => done.fail("store didn't set me observable")
      );

      // clear
      store.clearUser();

      done();
    } catch (e) {
      done.fail(e);
    }
  });

  it('should clear the user on reset', async (done) => {

    expect.assertions(1);

    // fake user
    const fakeUser = meFactory(1);

    // mock methods called
    UserModel.create.mockReturnValue(fakeUser);

    try {
      // set the user
      store.setUser(fakeUser);

      // me observable should be updated with the new user
      whenWithTimeout(
        () => Object.keys(store.me).length === 0,
        () => expect(store.me).toEqual({}),
        200,
        () => done.fail("store didn't set me observable")
      );

      // clear
      store.reset();

      done();
    } catch (e) {
      done.fail(e);
    }
  });

  it('should returns if the user has rewards', async (done) => {

    // fake user
    const fakeUser = meFactory(1);

    // mock methods called
    UserModel.create.mockReturnValue(fakeUser);

    try {
      // set the user
      store.setUser(fakeUser);

      expect(store.hasRewards()).toEqual(true);

      store.setRewards(false);

      expect(store.hasRewards()).toEqual(false);

      done();
    } catch (e) {
      done.fail(e);
    }
  });

  it('should returns if the user has wallet', async (done) => {

    // fake user
    const fakeUser = meFactory(1);

    // mock methods called
    UserModel.create.mockReturnValue(fakeUser);

    try {
      // set the user
      store.setUser(fakeUser);

      expect(store.hasEthWallet()).toEqual(true);

      store.setWallet(null);

      expect(store.hasEthWallet()).toEqual(false);

      done();
    } catch (e) {
      done.fail(e);
    }
  });

  it('should returns if the user is admin', async (done) => {

    // fake user
    const fakeUser = meFactory(1);
    fakeUser.admin = true;

    // mock methods called
    UserModel.create.mockReturnValue(fakeUser);

    try {
      // set the user
      store.setUser(fakeUser);

      expect(store.isAdmin()).toEqual(true);

      done();
    } catch (e) {
      done.fail(e);
    }
  });
});